from aiogram import Router, F
from aiogram.types import Message, CallbackQuery

from bot.utils.keyboards import main_menu_kb
from bot.utils.texts import HELP_TEXT

help_router = Router()


@help_router.message(F.text == "☎️ Yordam")
async def help_handler(message: Message) -> None:
    await message.answer(HELP_TEXT, disable_web_page_preview=True)