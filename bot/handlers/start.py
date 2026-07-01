from aiogram import Router
from aiogram.filters import Command, CommandObject
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext

from bot.config import settings
from bot.models.user import User
from bot.services.referral_service import get_referrer_by_code
from bot.services.user_service import get_or_create_user, update_user_activity
from bot.services.settings_service import is_setup_completed, get_setting, get_admin_ids
from bot.utils.keyboards import main_menu_kb
from bot.utils.texts import START_TEXT

start_router = Router()


@start_router.message(Command("start"))
async def start_handler(message: Message, command: CommandObject, user: User) -> None:
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
            referrer = await get_referrer_by_code(f"ref_{referrer_tg_id}")
            if referrer and not user.referred_by:
                user.referred_by = f"ref_{referrer_tg_id}"
                from bot.services.referral_service import add_referral_bonus
                from bot.services.user_service import add_referral_bonus_days
                await add_referral_bonus(referrer.id, user.id, "signal_days", 3)
                await add_referral_bonus_days(referrer.id, 3)

    # Get welcome message from DB settings
    welcome_msg = await get_setting("welcome_message")
    if not welcome_msg:
        welcome_msg = START_TEXT

    is_admin = user.telegram_id in await get_admin_ids()
    await message.answer(welcome_msg, reply_markup=main_menu_kb(is_admin=is_admin))


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
async def back_main_handler(callback: CallbackQuery, user: User) -> None:
    welcome_msg = await get_setting("welcome_message")
    if not welcome_msg:
        welcome_msg = START_TEXT
    is_admin = user.telegram_id in await get_admin_ids()
    await callback.message.edit_text(welcome_msg, reply_markup=None)
    await callback.message.answer(welcome_msg, reply_markup=main_menu_kb(is_admin=is_admin))
    await callback.answer()
