from aiogram import Router, F
from aiogram.types import Message, CallbackQuery

from bot.models.user import User
from bot.services.referral_service import get_referral_link, get_referral_count
from bot.services.settings_service import get_setting
from bot.utils.keyboards import main_menu_kb
from bot.utils.texts import REFERRAL_TEXT
from bot.config import settings

referral_router = Router()


@referral_router.message(F.text == "👥 Referal")
async def referral_handler(message: Message, user: User) -> None:
    bot_username = await get_setting("project_name") or settings.BOT_USERNAME
    link = await get_referral_link(bot_username, user.telegram_id)
    count = await get_referral_count(user.id)
    text = REFERRAL_TEXT.format(link=link, count=count)
    await message.answer(text, disable_web_page_preview=True)