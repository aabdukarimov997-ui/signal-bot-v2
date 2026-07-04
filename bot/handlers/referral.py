from aiogram import Router, F
from aiogram.types import Message, CallbackQuery

from bot.models.user import User
from bot.services.referral_service import get_referral_link, get_referral_count, get_referral_active_signal_count
from bot.utils.keyboards import main_menu_kb
from bot.utils.texts import REFERRAL_TEXT
from bot.config import settings

referral_router = Router()


@referral_router.message(F.text == "👥 Referal")
async def referral_handler(message: Message, user: User, bot) -> None:
    me = await bot.get_me()
    link = await get_referral_link(me.username, user.telegram_id)
    count = await get_referral_count(user.id)
    active_count = await get_referral_active_signal_count(user.telegram_id)
    text = REFERRAL_TEXT.format(link=link, count=count, active_count=active_count)
    await message.answer(text, disable_web_page_preview=True)