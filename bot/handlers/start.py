import logging

from aiogram import Router, Bot, F
from aiogram.filters import Command, CommandObject
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext

from bot.config import settings
from bot.models.user import User
from bot.services.user_service import get_or_create_user, update_user_activity, get_user_by_telegram_id
from bot.services.settings_service import is_setup_completed, get_setting, get_admin_ids
from bot.utils.keyboards import main_menu_kb
from bot.utils.texts import START_TEXT
from bot.utils.states import AdminSettingsStates

start_router = Router()


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