"""One persisted interface switch; the existing website is deliberately independent."""

import os
from urllib.parse import urlsplit, urlunsplit

from aiogram.types import KeyboardButton, ReplyKeyboardMarkup, WebAppInfo

from bot.config import settings
from bot.services.settings_service import get_setting
from bot.utils.keyboards import main_menu_kb


def validate_miniapp_url(value: str) -> bool:
    try:
        url = urlsplit(value)
        _ = url.port  # Reject malformed/out-of-range ports before creating Telegram buttons.
        return bool(
            not any(char.isspace() for char in value)
            and url.scheme == "https"
            and url.hostname
            and not url.username
            and not url.password
            and not url.fragment
            and not url.query
            and url.path.rstrip("/") in {"", "/miniapp"}
        )
    except ValueError:
        return False


def normalize_miniapp_url(value: str) -> str:
    """A bare bot domain must open /miniapp, never the root health JSON."""
    value = value.strip().rstrip("/")
    if not validate_miniapp_url(value):
        return ""
    url = urlsplit(value)
    return urlunsplit((url.scheme, url.netloc, "/miniapp", "", ""))


async def miniapp_url() -> str:
    # An explicitly configured URL wins, including over Railway's domain.
    # Invalid explicit values must not silently open some other service.
    configured = await get_setting("miniapp_url") or settings.MINIAPP_URL
    if configured:
        return normalize_miniapp_url(configured)
    domain = os.environ.get("RAILWAY_PUBLIC_DOMAIN", "").strip()
    return normalize_miniapp_url(f"https://{domain}") if domain else ""


async def interface_mode() -> str:
    return "miniapp" if await get_setting("interface_mode") == "miniapp" else "classic"


async def user_menu(is_admin: bool = False, quiz_enabled: bool = False) -> ReplyKeyboardMarkup:
    url = await miniapp_url()
    if await interface_mode() != "miniapp" or not url:
        return main_menu_kb(is_admin=is_admin, quiz_enabled=quiz_enabled)
    rows = [
        [KeyboardButton(text="🚀 Mini App ochish", web_app=WebAppInfo(url=url + "/"))],
        [KeyboardButton(text="📱 Oldingi menyu")],
    ]
    if is_admin:
        rows.append([KeyboardButton(text="🔐 Admin panel")])
    return ReplyKeyboardMarkup(keyboard=rows, resize_keyboard=True)
