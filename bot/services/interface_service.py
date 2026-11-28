"""One persisted interface switch; the existing website is deliberately independent."""

from urllib.parse import urlsplit

from aiogram.types import KeyboardButton, ReplyKeyboardMarkup, WebAppInfo

from bot.config import settings
from bot.services.settings_service import get_setting
from bot.utils.keyboards import main_menu_kb


def validate_miniapp_url(value: str) -> bool:
    try:
        url = urlsplit(value)
        return bool(
            url.scheme == "https"
            and url.hostname
            and not url.username
            and not url.password
            and not url.fragment
            and not url.query
        )
    except ValueError:
        return False


async def miniapp_url() -> str:
    return (await get_setting("miniapp_url") or settings.MINIAPP_URL).rstrip("/")


async def interface_mode() -> str:
    return "miniapp" if await get_setting("interface_mode") == "miniapp" else "classic"


async def user_menu(is_admin: bool = False, quiz_enabled: bool = False) -> ReplyKeyboardMarkup:
    url = await miniapp_url()
    if await interface_mode() != "miniapp" or not validate_miniapp_url(url):
        return main_menu_kb(is_admin=is_admin, quiz_enabled=quiz_enabled)
    rows = [
        [KeyboardButton(text="🚀 Mini App ochish", web_app=WebAppInfo(url=url + "/"))],
        [KeyboardButton(text="📱 Oldingi menyu")],
    ]
    if is_admin:
        rows.append([KeyboardButton(text="🔐 Admin panel")])
    return ReplyKeyboardMarkup(keyboard=rows, resize_keyboard=True)
