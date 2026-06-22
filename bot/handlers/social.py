from aiogram import Router, F
from aiogram.types import Message, CallbackQuery

from bot.config import settings
from bot.utils.keyboards import social_kb
from bot.utils.texts import SOCIAL_TEXT

social_router = Router()


@social_router.message(F.text == "🌐 Ijtimoiy tarmoqlar")
async def social_handler(message: Message) -> None:
    await message.answer(
        SOCIAL_TEXT,
        reply_markup=social_kb(
            instagram=settings.SOCIAL_INSTAGRAM,
            twitter=settings.SOCIAL_TWITTER,
            youtube=settings.SOCIAL_YOUTUBE,
            website=settings.SOCIAL_WEBSITE,
            free_channel=settings.FREE_CHANNEL_LINK,
        ),
    )