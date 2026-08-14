import base64
import hashlib
import hmac
import json
import logging
import os
import time

from aiogram import Router, Bot, F
from aiogram.filters import Command, CommandObject
from aiogram.types import Message, CallbackQuery, LabeledPrice
from aiogram.fsm.context import FSMContext

from bot.config import settings
from bot.models.user import User
from bot.services.user_service import get_or_create_user, update_user_activity, get_user_by_telegram_id
from bot.services.settings_service import is_setup_completed, get_setting, get_admin_ids, get_enabled_payment_methods
from bot.services.subscription_service import get_tariff_by_id
from bot.utils.keyboards import main_menu_kb, payment_method_kb
from bot.utils.texts import START_TEXT, PAYMENT_METHOD_TEXT
from bot.utils.states import AdminSettingsStates

start_router = Router()


# ─── Admin panelga sayt orqali kirish ─────────────────────────────────
# Bot admin'ga bir martalik imzolangan kirish havolasini yuboradi —
# foydalanuvchi uni bossa, sayt avtomatik admin sifatida tizimga kiradi.

def _make_admin_login_token(admin_id: int) -> str:
    """HMAC-SHA256 bilan imzolangan, 10 daqiqa amal qiladigan kirish tokeni."""
    secret = os.environ.get("ADMIN_LOGIN_SECRET", "")
    if not secret:
        raise ValueError("ADMIN_LOGIN_SECRET env o'rnatilmagan")
    payload = base64.urlsafe_b64encode(
        json.dumps({"id": str(admin_id), "exp": int(time.time()) + 600}).encode()
    ).decode()
    sig = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}.{sig}"


async def _handle_admin_login(message: Message, user: User) -> None:
    """Admin panelga kirish havolasini yuboradi (faqat adminlar uchun)."""
    if user.telegram_id not in await get_admin_ids():
        await message.answer("⛔ Bu havola faqat adminlar uchun.")
        return
    try:
        token = _make_admin_login_token(user.telegram_id)
    except ValueError as e:
        logging.getLogger(__name__).error(f"admin_login: {e}")
        await message.answer("❌ ADMIN_LOGIN_SECRET sozlanmagan. Admin bilan bog'laning.")
        return

    site = os.environ.get("SITE_URL") or settings.SOCIAL_WEBSITE or "https://aaa-abdulloh-8ecf.up.railway.app"
    link = f"{site}/api/auth/bot?token={token}"
    bot_username = settings.BOT_USERNAME or "AT_analysis_bot"
    await message.answer(
        "🔐 <b>Sayt admin paneliga kirish</b>\n\n"
        "Quyidagi havolani bosing — sayt avtomatik admin sifatida tizimga kiritadi:\n\n"
        f"<a href=\"{link}\">🔓 Admin panelga kirish</a>\n\n"
        f"⚠️ Havola <b>10 daqiqa</b> amal qiladi.\n"
        f"Yangi havola olish: <code>https://t.me/{bot_username}?start=admin_login</code>"
    )


async def _send_welcome(bot: Bot, chat_id: int, text: str, reply_markup, video_file_id: str | None) -> None:
    if video_file_id:
        try:
            await bot.send_video(chat_id=chat_id, video=video_file_id, caption=text, reply_markup=reply_markup)
            return
        except Exception as e:
            logging.getLogger(__name__).warning(f"Video send failed (file_id={video_file_id}): {e}")
    await bot.send_message(chat_id=chat_id, text=text, reply_markup=reply_markup)


@start_router.message(Command("start"))
async def start_handler(message: Message, command: CommandObject, user: User, bot: Bot) -> None:
    await update_user_activity(user.telegram_id)

    # TMA (Mini App) to'lov hand-off: /start pay_stars_{tariff_id} va /start pay_card_{tariff_id}
    if command.args:
        if command.args == "admin_login":
            await _handle_admin_login(message, user)
            return
        if command.args.startswith("pay_stars_"):
            await _handle_pay_stars(message, user, bot, command.args.replace("pay_stars_", ""))
            return
        if command.args.startswith("pay_card_"):
            await _handle_pay_card(message, user, bot, command.args.replace("pay_card_", ""))
            return

    # Check if setup wizard is needed for admin
    if user.telegram_id in await get_admin_ids():
        setup_done = await is_setup_completed()
        if not setup_done:
            await message.answer(
                "🛠 <b>Bot birinchi marta ishga tushdi!</b>\n\n"
                "Setup Wizard boshlash uchun /setup yuboring."
            )
            return

    # Handle referral
    if command.args and command.args.isdigit():
        referrer_tg_id = int(command.args)
        if referrer_tg_id != user.telegram_id:
            # Find referrer by telegram_id, not referral_code
            referrer = await get_user_by_telegram_id(referrer_tg_id)
            if referrer and not user.referred_by:
                user.referred_by = f"ref_{referrer_tg_id}"
                from bot.services.referral_service import add_referral_bonus
                from bot.services.user_service import add_referral_bonus_days
                await add_referral_bonus(referrer.id, user.id, "signal_days", 3)
                await add_referral_bonus_days(referrer.id, 3)

    # Get welcome message and video from DB settings
    welcome_msg = await get_setting("welcome_message")
    if not welcome_msg:
        welcome_msg = START_TEXT
    welcome_video = await get_setting("welcome_video")

    is_admin = user.telegram_id in await get_admin_ids()
    await _send_welcome(bot, message.chat.id, welcome_msg, main_menu_kb(is_admin=is_admin), welcome_video)


@start_router.message(Command("setup"))
async def setup_command_handler(message: Message, user: User, state: FSMContext) -> None:
    if user.telegram_id not in await get_admin_ids():
        await message.answer("⛔ Bu buyruq faqat adminlar uchun.")
        return
    setup_done = await is_setup_completed()
    if setup_done:
        await message.answer("✅ Setup allaqachon tugallangan.\nSozlamalarni o'zgartirish: /admin → ⚙️ Sozlamalar")
        return
    from bot.handlers.setup import start_wizard
    await start_wizard(message, state)


@start_router.callback_query(lambda c: c.data == "back_main")
async def back_main_handler(callback: CallbackQuery, user: User, bot: Bot) -> None:
    welcome_msg = await get_setting("welcome_message")
    if not welcome_msg:
        welcome_msg = START_TEXT
    welcome_video = await get_setting("welcome_video")
    try:
        await callback.message.delete()
    except Exception:
        pass
    is_admin = user.telegram_id in await get_admin_ids()
    await _send_welcome(bot, callback.message.chat.id, welcome_msg, main_menu_kb(is_admin=is_admin), welcome_video)
    await callback.answer()


@start_router.message(F.text == "🚀 Start")
async def start_button_handler(message: Message, user: User, bot: Bot) -> None:
    await update_user_activity(user.telegram_id)
    welcome_msg = await get_setting("welcome_message")
    if not welcome_msg:
        welcome_msg = START_TEXT
    welcome_video = await get_setting("welcome_video")
    is_admin = user.telegram_id in await get_admin_ids()
    await _send_welcome(bot, message.chat.id, welcome_msg, main_menu_kb(is_admin=is_admin), welcome_video)


@start_router.message(Command("test_video"))
async def test_video_handler(message: Message, user: User, bot: Bot) -> None:
    """Admin uchun: welcome_video qiymatini ko'rsatadi va videoni qayta yuboradi."""
    if user.telegram_id not in await get_admin_ids():
        return
    current_video = await get_setting("welcome_video")
    welcome_msg = await get_setting("welcome_message") or START_TEXT
    if not current_video:
        await message.answer("📹 <b>welcome_video hali o'rnatilmagan.</b>\n\n"
            "/set_welcome_video buyrug'ini yuboring va video jo'nating.")
        return
    await message.answer(f"📹 Joriy file_id: <code>{current_video}</code>\n\nVideoni qayta yuboraman:")
    await _send_welcome(bot, message.chat.id, welcome_msg, None, current_video)

# ─── TMA to'lov hand-off handler'lar ─────────────────────────────────
# Mini App (TMA) dan /start pay_stars_{tariff_id} yoki /start pay_card_{tariff_id}
# payload bilan keladi — bu yerda bot'ning nativ to'lov oqimiga ulanamiz.


async def _handle_pay_stars(message: Message, user: User, bot: Bot, tariff_id: str) -> None:
    """Telegram Stars to'lov: invoice yuboramiz, foydalanuvchi to'lagach
    successful_payment_handler to'liq oqimni bajaradi (obuna + invite link + xabar)."""
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await message.answer("❌ Tarif topilmadi.")
        return

    stars_key = f"signal_stars_{tariff.duration_months}_month"
    stars_from_db = await get_setting(stars_key)
    stars_amount = 0
    if stars_from_db and str(stars_from_db).isdigit():
        stars_amount = int(stars_from_db)
    if stars_amount <= 0:
        stars_amount = tariff.stars_price or 0
    if stars_amount <= 0:
        await message.answer(
            "❌ Stars narxi sozlanmagan. Iltimos, karta orqali to'lang yoki admin bilan bog'laning."
        )
        return

    prices = [LabeledPrice(label=tariff.label or tariff.name, amount=int(stars_amount))]
    await bot.send_invoice(
        chat_id=message.chat.id,
        title=f"📈 {tariff.label or tariff.name}",
        description=f"Signal kanaliga {tariff.label or tariff.name} obuna",
        payload=f"signal_stars_{tariff.id}",
        provider_token="",
        currency="XTR",
        prices=prices,
    )


async def _handle_pay_card(message: Message, user: User, bot: Bot, tariff_id: str) -> None:
    """Karta/chek to'lov: to'lov usullari menyusini ko'rsatamiz —
    qolgan oqim (chek yuklash → admin tasdiqlash → invite link) nativ tarzda ishlaydi."""
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await message.answer("❌ Tarif topilmadi.")
        return

    enabled_methods = await get_enabled_payment_methods()
    text = (
        f"📈 <b>{tariff.label or tariff.name}</b>\n\n"
        f"💰 Narx: <b>${float(tariff.price):.0f}</b>\n\n"
        f"{PAYMENT_METHOD_TEXT}"
    )
    await message.answer(text, reply_markup=payment_method_kb(tariff.id, enabled_methods))
