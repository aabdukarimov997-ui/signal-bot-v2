from aiogram import Router, F
from aiogram.types import Message, CallbackQuery

from bot.config import settings
from bot.services.settings_service import get_setting
from bot.utils.keyboards import social_kb
from bot.utils.texts import SOCIAL_TEXT

social_router = Router()


@social_router.message(F.text == "🌐 Ijtimoiy tarmoqlar")
async def social_handler(message: Message) -> None:
    await message.answer(
        SOCIAL_TEXT,
        reply_markup=social_kb(
            instagram=await get_setting("instagram_url") or settings.SOCIAL_INSTAGRAM,
            twitter=await get_setting("twitter_url") or settings.SOCIAL_TWITTER,
            youtube=await get_setting("youtube_url") or settings.SOCIAL_YOUTUBE,
            website=await get_setting("website_url") or settings.SOCIAL_WEBSITE,
            free_channel=await get_setting("free_channel_url") or settings.FREE_CHANNEL_LINK,
        ),
    )