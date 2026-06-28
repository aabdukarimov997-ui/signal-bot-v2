from aiogram import Router, F
from aiogram.types import Message, CallbackQuery

from bot.config import settings
from bot.services.settings_service import get_setting
from bot.utils.texts import HELP_TEXT

help_router = Router()


@help_router.message(F.text == "☎️ Yordam")
async def help_handler(message: Message) -> None:
    admin_link = await get_setting("support_username") or settings.ADMIN_LINK
    await message.answer(HELP_TEXT.format(admin_link=admin_link), disable_web_page_preview=True)