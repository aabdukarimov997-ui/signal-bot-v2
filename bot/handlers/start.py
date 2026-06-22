from aiogram import Router
from aiogram.filters import Command, CommandObject
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext

from bot.models.user import User
from bot.services.referral_service import get_referrer_by_code
from bot.services.user_service import get_or_create_user, update_user_activity
from bot.utils.keyboards import main_menu_kb
from bot.utils.texts import START_TEXT

start_router = Router()


@start_router.message(Command("start"))
async def start_handler(message: Message, command: CommandObject, user: User) -> None:
    await update_user_activity(user.telegram_id)

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

    await message.answer(START_TEXT, reply_markup=main_menu_kb())


@start_router.callback_query(lambda c: c.data == "back_main")
async def back_main_handler(callback: CallbackQuery) -> None:
    await callback.message.edit_text(START_TEXT, reply_markup=None)
    await callback.message.answer(START_TEXT, reply_markup=main_menu_kb())
    await callback.answer()