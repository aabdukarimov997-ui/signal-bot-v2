"""Authenticated adapter to the SAME Dispatcher/FSM as Telegram polling.

Bot replies still reach Telegram. A task-local session middleware mirrors only
replies to the authenticated private chat, so existing handlers are not forked.
Callback payloads must have been issued to this user by the bot; arbitrary
callback injection (especially admin/payment callbacks) is not accepted.
"""

import asyncio
import logging
import secrets
import time
from collections import OrderedDict
from contextvars import ContextVar
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path

from aiogram import Bot, Dispatcher
from aiogram.methods import AnswerCallbackQuery
from aiogram.types import BufferedInputFile, CallbackQuery, Chat, Message, Update
from aiohttp import web
from pydantic import ValidationError
from sqlalchemy import select

from bot.config import settings
from bot.database.session import get_session
from bot.miniapp.auth import validate_init_data
from bot.models.payment import Payment
from bot.services.interface_service import interface_mode
from bot.services.pricing_service import build_price
from bot.services.quiz_service import is_quiz_enabled
from bot.services.referral_service import get_referral_count
from bot.services.settings_service import get_admin_ids, get_setting
from bot.services.subscription_service import get_all_tariffs
from bot.services.user_service import get_or_create_user

STATIC = Path(__file__).parent / "static"
logger = logging.getLogger(__name__)
MAX_UPLOAD = 8 * 1024 * 1024


@dataclass
class Conversation:
    telegram_id: int
    touched: float = field(default_factory=time.monotonic)
    lock: asyncio.Lock = field(default_factory=asyncio.Lock)
    messages: OrderedDict = field(default_factory=OrderedDict)
    cards: list = field(default_factory=list)
    alerts: list = field(default_factory=list)
    admin: bool = False


current: ContextVar[Conversation | None] = ContextVar("miniapp_conversation", default=None)


def serialize_message(message: Message) -> dict:
    rows = []
    markup = message.reply_markup
    if markup:
        for row in markup.inline_keyboard:
            buttons = []
            for button in row:
                if button.callback_data:
                    buttons.append({"text": button.text, "callback": button.callback_data})
                elif button.url:
                    buttons.append({"text": button.text, "url": button.url})
                elif button.web_app:
                    buttons.append({"text": button.text, "url": button.web_app.url})
                elif button.pay:
                    buttons.append({"text": "⭐ Telegram chatida to'lash", "native": True})
            if buttons:
                rows.append(buttons)
    return {
        "id": message.message_id,
        "text": message.html_text or message.html_caption or "",
        "buttons": rows,
        "media": bool(message.photo or message.video or message.document or message.animation),
        "invoice": bool(message.invoice),
    }


async def mirror_requests(make_request, bot: Bot, method):
    conversation = current.get()
    # A synthetic callback has no Telegram query ID. Acknowledge locally only.
    if conversation and isinstance(method, AnswerCallbackQuery):
        if method.text:
            conversation.alerts.append(method.text)
        return True
    result = await make_request(bot, method)
    if conversation and isinstance(result, Message) and result.chat.id == conversation.telegram_id:
        conversation.messages[result.message_id] = (result, conversation.admin)
        conversation.messages.move_to_end(result.message_id)
        while len(conversation.messages) > 60:
            conversation.messages.popitem(last=False)
        conversation.cards.append(serialize_message(result))
    return result


@web.middleware
async def errors(request, handler):
    try:
        response = await handler(request)
    except web.HTTPException as exc:
        if "/api/" not in request.path:
            raise
        response = web.json_response({"error": exc.text}, status=exc.status)
    except Exception:
        logger.exception("Mini App request failed: %s", request.path)
        response = web.json_response(
            {"error": "Xatolik yuz berdi. Qayta urinib ko'ring yoki bot chatini oching."}, status=500
        )
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    if "/api/" in request.path:
        response.headers["Cache-Control"] = "no-store"
    return response


class MiniApp:
    def __init__(self, bot: Bot | None, dispatcher: Dispatcher | None):
        self.bot = bot
        self.dispatcher = dispatcher
        self.conversations: OrderedDict[int, Conversation] = OrderedDict()
        if bot:
            bot.session.middleware(mirror_requests)

    async def authenticate(self, request):
        if self.bot is None or self.dispatcher is None:
            raise web.HTTPServiceUnavailable(text="Bot ishga tushmagan.")
        try:
            tg_user = validate_init_data(request.headers.get("X-Telegram-Init-Data", ""), settings.BOT_TOKEN)
        except (ValueError, TypeError, ValidationError):
            raise web.HTTPUnauthorized(text="Telegram orqali qayta oching.") from None
        user = await get_or_create_user(tg_user.id, tg_user.full_name, tg_user.username)
        if user.is_banned:
            raise web.HTTPForbidden(text="Hisob bloklangan.")
        admin = tg_user.id in await get_admin_ids()
        if await interface_mode() != "miniapp" and not admin:
            raise web.HTTPForbidden(text="Mini App o'chirilgan. Botning oldingi menyusidan foydalaning.")
        return tg_user, user, admin

    def conversation(self, user_id: int) -> Conversation:
        now = time.monotonic()
        for key, value in list(self.conversations.items()):
            if now - value.touched > 3600 and not value.lock.locked():
                del self.conversations[key]
        if user_id not in self.conversations:
            if len(self.conversations) >= 1000:
                victim = next((k for k, v in self.conversations.items() if not v.lock.locked()), None)
                if victim is None:
                    raise web.HTTPTooManyRequests(text="Server band. Keyinroq urinib ko'ring.")
                del self.conversations[victim]
            self.conversations[user_id] = Conversation(user_id)
        result = self.conversations[user_id]
        self.conversations.move_to_end(user_id)
        result.touched = now
        return result

    async def bootstrap(self, request):
        tg_user, user, admin = await self.authenticate(request)
        tariffs = []
        for product in ("signal", "course"):
            for tariff in await get_all_tariffs(product):
                price = await build_price(user.id, float(tariff.price), product)
                tariffs.append(
                    {
                        "id": tariff.id,
                        "name": tariff.name,
                        "duration": tariff.duration_display,
                        "product": product,
                        "price": price.final,
                        "base": price.base,
                        "discount": price.discount_percent,
                    }
                )
        now = datetime.now(UTC)
        subscriptions = []
        async with get_session() as session:
            from bot.models.subscription import Subscription
            from bot.models.tariff import SignalTariff

            sub_rows = await session.execute(
                select(Subscription, SignalTariff.product_type)
                .outerjoin(SignalTariff, Subscription.tariff_id == SignalTariff.id)
                .where(Subscription.user_id == user.id)
                .order_by(Subscription.end_date.desc())
                .limit(50)
            )
            for sub, product in sub_rows:
                end = sub.end_date.replace(tzinfo=UTC) if sub.end_date.tzinfo is None else sub.end_date
                subscriptions.append(
                    {
                        "end": end.isoformat(),
                        "product": product,
                        "active": sub.status == "active" and end > now,
                        "days": max(0, (end - now).days),
                    }
                )
            rows = (
                (
                    await session.execute(
                        select(Payment).where(Payment.user_id == user.id).order_by(Payment.created_at.desc()).limit(10)
                    )
                )
                .scalars()
                .all()
            )
            payments = [
                {
                    "amount": float(p.amount),
                    "currency": p.currency,
                    "status": p.status,
                    "method": p.payment_method,
                    "date": p.created_at.isoformat(),
                }
                for p in rows
            ]
        me = await self.bot.get_me()
        return web.json_response(
            {
                "project": await get_setting("project_name") or "Signal Club",
                "user": {
                    "name": tg_user.first_name,
                    "id": tg_user.id,
                    "admin": admin,
                    "bonus": user.referral_bonus_days or 0,
                },
                "tariffs": tariffs,
                "subscriptions": subscriptions,
                "payments": payments,
                "referrals": await get_referral_count(user.id),
                "referralLink": f"https://t.me/{me.username}?start={tg_user.id}",
                "botUrl": f"https://t.me/{me.username}",
                "quiz": await is_quiz_enabled(),
                "mode": await interface_mode(),
            }
        )

    async def check_role_change(self, conversation, tg_user, admin):
        if conversation.admin and not admin:
            state = self.dispatcher.fsm.get_context(bot=self.bot, chat_id=tg_user.id, user_id=tg_user.id)
            await state.clear()
            conversation.messages.clear()
            conversation.admin = False
            raise web.HTTPForbidden(text="Admin huquqi o'zgargan. Bo'limni qayta oching.")

    async def action(self, request):
        tg_user, user, admin = await self.authenticate(request)
        try:
            data = await request.json()
            if not isinstance(data, dict):
                raise ValueError
        except (ValueError, TypeError):
            raise web.HTTPBadRequest(text="Noto'g'ri so'rov.") from None
        conversation = self.conversation(tg_user.id)
        if conversation.lock.locked():
            raise web.HTTPTooManyRequests(text="Oldingi amal tugashini kuting.")
        async with conversation.lock:
            await self.check_role_change(conversation, tg_user, admin)
            conversation.cards = []
            conversation.alerts = []
            conversation.admin = admin
            message = Message(
                message_id=secrets.randbelow(2**30) + 1,
                date=datetime.now(UTC),
                chat=Chat(id=tg_user.id, type="private"),
                from_user=tg_user,
            )
            if data.get("callback"):
                try:
                    issued, admin_only = conversation.messages[int(data.get("message_id", 0))]
                except (KeyError, ValueError, TypeError):
                    raise web.HTTPBadRequest(text="Tugma eskirgan. Bo'limni qayta oching.") from None
                if admin_only and not admin:
                    raise web.HTTPForbidden(text="Admin huquqi kerak.")
                allowed = {
                    b.callback_data
                    for row in (issued.reply_markup.inline_keyboard if issued.reply_markup else [])
                    for b in row
                    if b.callback_data
                }
                if data["callback"] not in allowed:
                    raise web.HTTPForbidden(text="Bu tugma sizga tegishli emas.")
                query = CallbackQuery(
                    id="miniapp-" + secrets.token_hex(8),
                    from_user=tg_user,
                    chat_instance="miniapp",
                    message=issued,
                    data=data["callback"],
                )
                update = Update(update_id=secrets.randbelow(2**30), callback_query=query)
            else:
                text = data.get("text", "")
                if not isinstance(text, str) or not text.strip() or len(text) > 4096:
                    raise web.HTTPBadRequest(text="1–4096 belgili matn kiriting.")
                message = message.model_copy(update={"text": text.strip()})
                update = Update(update_id=secrets.randbelow(2**30), message=message)
            token = current.set(conversation)
            try:
                await self.dispatcher.feed_update(self.bot, update)
            finally:
                current.reset(token)
            return web.json_response({"cards": conversation.cards, "alerts": conversation.alerts})

    async def upload(self, request):
        tg_user, user, admin = await self.authenticate(request)
        conversation = self.conversation(tg_user.id)
        if conversation.lock.locked():
            raise web.HTTPTooManyRequests(text="Oldingi amal tugashini kuting.")
        async with conversation.lock:
            await self.check_role_change(conversation, tg_user, admin)
            if not request.content_type.startswith("multipart/"):
                raise web.HTTPBadRequest(text="Rasmni multipart formatda yuboring.")
            reader = await request.multipart()
            part = await reader.next()
            if not part or part.name != "photo":
                raise web.HTTPBadRequest(text="Rasm tanlang.")
            content = bytearray()
            while chunk := await part.read_chunk():
                content.extend(chunk)
                if len(content) > MAX_UPLOAD:
                    raise web.HTTPRequestEntityTooLarge(max_size=MAX_UPLOAD, actual_size=len(content))
            # Decode untrusted bytes rather than trusting extension/MIME type.
            from io import BytesIO

            from PIL import Image, UnidentifiedImageError

            try:
                image = Image.open(BytesIO(content))
                if image.format not in {"PNG", "JPEG", "WEBP"} or image.width * image.height > 20_000_000:
                    raise ValueError
                image.verify()
            except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError):
                raise web.HTTPBadRequest(text="8 MB gacha JPG, PNG yoki WEBP rasm yuboring.") from None
            sent = await self.bot.send_photo(tg_user.id, BufferedInputFile(bytes(content), filename="receipt.jpg"))
            incoming = sent.model_copy(update={"from_user": tg_user})
            conversation.cards = []
            conversation.alerts = []
            conversation.admin = admin
            token = current.set(conversation)
            try:
                await self.dispatcher.feed_update(
                    self.bot, Update(update_id=secrets.randbelow(2**30), message=incoming)
                )
            finally:
                current.reset(token)
            return web.json_response({"cards": conversation.cards, "alerts": conversation.alerts})


async def redirect_to_app(request):
    raise web.HTTPFound("/miniapp/")


async def index(request):
    return web.FileResponse(STATIC / "index.html", headers={"Cache-Control": "no-cache"})


def install(app: web.Application, bot: Bot | None = None, dispatcher: Dispatcher | None = None):
    adapter = MiniApp(bot, dispatcher)
    app.middlewares.append(errors)
    app.router.add_get("/miniapp", redirect_to_app)
    app.router.add_get("/miniapp/", index)
    app.router.add_get("/miniapp/api/bootstrap", adapter.bootstrap)
    app.router.add_post("/miniapp/api/action", adapter.action)
    app.router.add_post("/miniapp/api/upload", adapter.upload)
    app.router.add_static("/miniapp/assets/", STATIC, show_index=False)
