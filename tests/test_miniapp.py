"""Offline security and Dispatcher/FSM integration tests; never contact Telegram."""

import hashlib
import hmac
import json
import time
from datetime import UTC, datetime
from unittest.mock import AsyncMock
from urllib.parse import urlencode

import pytest
import pytest_asyncio
from aiogram import Bot, Dispatcher, F, Router
from aiogram.client.session.base import BaseSession
from aiogram.fsm.context import FSMContext
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message
from aiogram.types import User as TelegramUser
from aiohttp import FormData, web
from aiohttp.test_utils import TestClient, TestServer

from bot.config import settings
from bot.miniapp.auth import validate_init_data
from bot.miniapp.server import MiniApp, errors
from bot.services.interface_service import interface_mode, user_menu, validate_miniapp_url
from bot.services.settings_service import get_setting, set_setting
from bot.services.user_service import ban_user

TOKEN = "123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi"


def signed_data(user_id=23456, *, timestamp=None, token=None, **extra):
    payload = {
        "auth_date": str(int(time.time()) if timestamp is None else timestamp),
        "user": json.dumps({"id": user_id, "is_bot": False, "first_name": "Ali"}),
        "query_id": "test-query",
        **extra,
    }
    check = "\n".join(f"{k}={v}" for k, v in sorted(payload.items()))
    secret = hmac.new(b"WebAppData", (token or settings.BOT_TOKEN).encode(), hashlib.sha256).digest()
    payload["hash"] = hmac.new(secret, check.encode(), hashlib.sha256).hexdigest()
    return urlencode(payload)


@pytest.mark.parametrize(
    "url,valid",
    [
        ("https://bot.example/miniapp", True),
        ("https://bot.example/miniapp/", True),
        ("http://bot.example/miniapp", False),
        ("javascript:alert(1)", False),
        ("https://user:password@bot.example/miniapp", False),
        ("https://bot.example/miniapp?token=secret", False),
        ("https://bot.example/miniapp#x", False),
        ("https://", False),
    ],
)
def test_url_validation(url, valid):
    assert validate_miniapp_url(url) is valid


def test_auth_valid_signature():
    user = validate_init_data(signed_data(timestamp=1000), settings.BOT_TOKEN, now=1010)
    assert user.id == 23456
    assert user.first_name == "Ali"


@pytest.mark.parametrize(
    "raw,now",
    [
        ("", 1000),
        (signed_data(timestamp=1000) + "&auth_date=1000", 1000),
        (signed_data(timestamp=1000, token="wrong-token"), 1000),
        (signed_data(timestamp=1000), 5000),
        (signed_data(timestamp=1100), 1000),
        (signed_data(timestamp=1000).replace("Ali", "Evil"), 1000),
    ],
)
def test_auth_rejects_invalid_data(raw, now):
    with pytest.raises(ValueError):
        validate_init_data(raw, settings.BOT_TOKEN, now=now)


async def test_default_mode_and_safe_fallback(monkeypatch):
    monkeypatch.setattr(settings, "MINIAPP_URL", "")
    assert await interface_mode() == "classic"
    classic = await user_menu()
    assert classic.keyboard[0][0].text == "📈 Signal kanal"
    await set_setting("interface_mode", "miniapp")
    assert (await user_menu()).keyboard[0][0].web_app is None
    await set_setting("miniapp_url", "https://bot.example/miniapp")
    assert (await user_menu()).keyboard[0][0].web_app.url == "https://bot.example/miniapp/"
    await set_setting("interface_mode", "classic")
    assert (await user_menu()).keyboard[0][0].text == "📈 Signal kanal"


class OfflineSession(BaseSession):
    def __init__(self):
        super().__init__()
        self.methods = []
        self.counter = 100

    async def close(self):
        pass

    async def stream_content(self, *args, **kwargs):
        yield b""

    async def make_request(self, bot, method, timeout=None):
        self.methods.append(method)
        if method.__api_method__ == "getMe":
            return TelegramUser(id=123456789, is_bot=True, first_name="Bot", username="test_bot")
        if method.__api_method__ == "answerCallbackQuery":
            raise AssertionError("Synthetic callback acknowledgements must not reach Telegram")
        if method.__api_method__ == "deleteMessage":
            return True
        self.counter += 1
        values = {
            "message_id": getattr(method, "message_id", None) or self.counter,
            "date": datetime.now(UTC),
            "chat": {"id": method.chat_id, "type": "private"},
            "from_user": {"id": 123456789, "is_bot": True, "first_name": "Bot"},
            "text": getattr(method, "text", None),
            "reply_markup": getattr(method, "reply_markup", None),
        }
        if method.__api_method__ == "sendPhoto":
            values["photo"] = [{"file_id": "uploaded-photo", "file_unique_id": "unique", "width": 1, "height": 1}]
        return Message.model_validate(values)


@pytest_asyncio.fixture
async def miniapp_client():
    session = OfflineSession()
    bot = Bot(TOKEN, session=session)
    dp = Dispatcher()
    router = Router()

    @router.message(F.text == "menu")
    async def menu(message: Message):
        await message.answer(
            "Choose",
            reply_markup=InlineKeyboardMarkup(
                inline_keyboard=[
                    [InlineKeyboardButton(text="Continue", callback_data="next")],
                ]
            ),
        )
        await bot.send_message(99999, "Secret admin notification")

    @router.callback_query(F.data == "next")
    async def callback(query, state: FSMContext):
        await state.set_state("test:input")
        await query.message.edit_text("Enter promo or upload receipt")
        await query.answer("Ready")

    @router.message(F.photo)
    async def receipt(message: Message, state: FSMContext):
        assert await state.get_state() == "test:input"
        assert message.from_user.id == message.chat.id
        await message.answer("Receipt received: " + message.photo[-1].file_id)
        await state.clear()

    @router.message()
    async def input_handler(message: Message, state: FSMContext):
        value = await state.get_state()
        await message.answer(f"State={value}; input={message.text}")
        await state.clear()

    dp.include_router(router)
    adapter = MiniApp(bot, dp)
    app = web.Application(middlewares=[errors], client_max_size=9 * 1024 * 1024)
    app.router.add_get("/miniapp/api/bootstrap", adapter.bootstrap)
    app.router.add_post("/miniapp/api/action", adapter.action)
    app.router.add_post("/miniapp/api/upload", adapter.upload)
    await set_setting("interface_mode", "miniapp")
    async with TestClient(TestServer(app)) as client:
        yield client, adapter, session
    await dp.storage.close()
    await bot.session.close()


def headers(user_id=23456):
    return {"X-Telegram-Init-Data": signed_data(user_id)}


async def test_http_auth_ban_and_mode(miniapp_client):
    client, adapter, session = miniapp_client
    response = await client.post("/miniapp/api/action", json={"text": "menu"})
    assert response.status == 401
    await set_setting("interface_mode", "classic")
    response = await client.post("/miniapp/api/action", headers=headers(), json={"text": "menu"})
    assert response.status == 403
    await set_setting("interface_mode", "miniapp")
    await ban_user(23456)
    response = await client.post("/miniapp/api/action", headers=headers(), json={"text": "menu"})
    assert response.status == 403


async def test_bootstrap_real_tariff_and_user_data(miniapp_client, sample_tariff):
    client, adapter, session = miniapp_client
    response = await client.get("/miniapp/api/bootstrap", headers=headers())
    assert response.status == 200
    assert response.headers["Cache-Control"] == "no-store"
    payload = await response.json()
    assert payload["user"]["id"] == 23456
    assert payload["tariffs"][0]["id"] == sample_tariff.id
    assert payload["tariffs"][0]["price"] == 25
    assert payload["payments"] == []
    assert payload["referralLink"] == "https://t.me/test_bot?start=23456"


async def test_bridge_callback_fsm_and_no_cross_chat_leak(miniapp_client):
    client, adapter, session = miniapp_client
    response = await client.post("/miniapp/api/action", headers=headers(), json={"text": "menu"})
    assert response.status == 200
    payload = await response.json()
    assert len(payload["cards"]) == 1
    card = payload["cards"][0]
    assert "Secret" not in json.dumps(payload)
    response = await client.post(
        "/miniapp/api/action",
        headers=headers(),
        json={
            "callback": "next",
            "message_id": card["id"],
        },
    )
    assert response.status == 200
    assert (await response.json())["alerts"] == ["Ready"]
    response = await client.post("/miniapp/api/action", headers=headers(), json={"text": "PROMO10"})
    payload = await response.json()
    assert "State=test:input; input=PROMO10" in payload["cards"][0]["text"]


async def test_reject_callback_forgery_and_other_users_message(miniapp_client):
    client, adapter, session = miniapp_client
    response = await client.post("/miniapp/api/action", headers=headers(), json={"text": "menu"})
    card = (await response.json())["cards"][0]
    response = await client.post(
        "/miniapp/api/action",
        headers=headers(),
        json={
            "callback": "admin_approve_fake",
            "message_id": card["id"],
        },
    )
    assert response.status == 403
    response = await client.post(
        "/miniapp/api/action",
        headers=headers(34567),
        json={
            "callback": "next",
            "message_id": card["id"],
        },
    )
    assert response.status == 400
    response = await client.post("/miniapp/api/action", headers=headers(), json={"text": "x" * 4097})
    assert response.status == 400


async def test_revoked_admin_cannot_reuse_issued_buttons(miniapp_client):
    client, adapter, session = miniapp_client
    response = await client.post("/miniapp/api/action", headers=headers(12345), json={"text": "menu"})
    card = (await response.json())["cards"][0]
    await set_setting("admin_ids", "[]")
    response = await client.post(
        "/miniapp/api/action",
        headers=headers(12345),
        json={
            "callback": "next",
            "message_id": card["id"],
        },
    )
    assert response.status == 403


async def test_receipt_upload_uses_authenticated_user_and_same_fsm(miniapp_client):
    from io import BytesIO

    from PIL import Image

    client, adapter, session = miniapp_client
    response = await client.post("/miniapp/api/action", headers=headers(), json={"text": "menu"})
    card = (await response.json())["cards"][0]
    await client.post("/miniapp/api/action", headers=headers(), json={"callback": "next", "message_id": card["id"]})
    image = BytesIO()
    Image.new("RGB", (1, 1)).save(image, "PNG")
    form = FormData()
    form.add_field("photo", image.getvalue(), filename="receipt.png", content_type="image/png")
    response = await client.post("/miniapp/api/upload", headers=headers(), data=form)
    assert response.status == 200
    assert "Receipt received: uploaded-photo" in (await response.json())["cards"][0]["text"]
    form = FormData()
    form.add_field("photo", b"not an image", filename="fake.png", content_type="image/png")
    response = await client.post("/miniapp/api/upload", headers=headers(), data=form)
    assert response.status == 400


async def test_interface_switch_denies_nonadmin_and_missing_url(monkeypatch):
    from bot.handlers.admin.interface import interface_handler

    monkeypatch.setattr(settings, "MINIAPP_URL", "")
    query = AsyncMock()
    query.data = "interface_miniapp"
    state = AsyncMock()
    user = AsyncMock()
    user.telegram_id = 23456
    await interface_handler(query, user, state)
    assert await get_setting("interface_mode") is None
    user.telegram_id = 12345
    await interface_handler(query, user, state)
    assert await get_setting("interface_mode") is None
    await set_setting("miniapp_url", "https://bot.example/miniapp")
    await interface_handler(query, user, state)
    assert await interface_mode() == "miniapp"
    query.data = "interface_classic"
    await interface_handler(query, user, state)
    assert await interface_mode() == "classic"


async def test_real_bot_handlers_signal_course_quiz_and_support(sample_tariff):
    """Exercise existing production routers through HTTP, not a parallel implementation."""
    from bot.database.session import get_session
    from bot.handlers.course import course_router
    from bot.handlers.help import help_router
    from bot.handlers.quiz import quiz_router
    from bot.handlers.signals import signal_router
    from bot.middlewares.auth import AuthMiddleware
    from bot.middlewares.reset_state import ResetStateMiddleware
    from bot.models.contact_message import ContactMessage
    from bot.models.tariff import SignalTariff

    session = OfflineSession()
    bot = Bot(TOKEN, session=session)
    dp = Dispatcher()
    dp.message.middleware(ResetStateMiddleware())
    dp.callback_query.middleware(ResetStateMiddleware())
    dp.message.middleware(AuthMiddleware())
    dp.callback_query.middleware(AuthMiddleware())
    dp.include_routers(signal_router, course_router, quiz_router, help_router)
    adapter = MiniApp(bot, dp)
    app = web.Application(middlewares=[errors])
    app.router.add_post("/miniapp/api/action", adapter.action)
    await set_setting("interface_mode", "miniapp")
    await set_setting("quiz_enabled", "true")
    await set_setting("crypto_auto_enabled", "false")
    async with get_session() as db:
        course = SignalTariff(name="Kurs", duration_months=1, product_type="course", price=50)
        db.add(course)
        await db.flush()
        course_id = course.id
    async with TestClient(TestServer(app)) as client:

        async def action(payload):
            response = await client.post("/miniapp/api/action", headers=headers(), json=payload)
            assert response.status == 200, await response.text()
            return await response.json()

        async def click(payload, callback):
            card = next(
                c for c in payload["cards"] if any(b.get("callback") == callback for row in c["buttons"] for b in row)
            )
            return await action({"message_id": card["id"], "callback": callback})

        payload = await action({"text": "📈 Signal kanal"})
        payload = await click(payload, f"tariff_{sample_tariff.id}")
        assert any(
            b.get("callback") == f"card_{sample_tariff.id}"
            for c in payload["cards"]
            for row in c["buttons"]
            for b in row
        )
        payload = await action({"text": "📚 Darslar"})
        payload = await click(payload, f"course_tariff_{course_id}")
        assert any(
            b.get("callback") == f"course_stars_{course_id}"
            for c in payload["cards"]
            for row in c["buttons"]
            for b in row
        )
        payload = await action({"text": "🎯 Viktorina"})
        payload = await click(payload, "quiz_start")
        assert "Savol 1/" in payload["cards"][0]["text"]
        payload = await action({"text": "☎️ Yordam"})
        payload = await click(payload, "contact_send")
        await action({"text": "Mini App orqali yordam kerak"})
        from sqlalchemy import select

        async with get_session() as db:
            messages = (await db.execute(select(ContactMessage))).scalars().all()
            assert len(messages) == 1
            assert messages[0].message_text == "Mini App orqali yordam kerak"
    await dp.storage.close()
    await bot.session.close()
