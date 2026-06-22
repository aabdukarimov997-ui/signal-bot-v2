from aiogram import Router, F
from aiogram.types import Message, CallbackQuery

from bot.config import settings
from bot.utils.texts import HELP_TEXT

help_router = Router()


@help_router.message(F.text == "☎️ Yordam")
async def help_handler(message: Message) -> None:
    await message.answer(HELP_TEXT.format(admin_link=settings.ADMIN_LINK), disable_web_page_preview=True)