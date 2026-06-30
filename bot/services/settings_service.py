import json
from typing import Optional

from sqlalchemy import select, delete

from bot.database.session import get_session
from bot.models.project_settings import ProjectSettings

# Default settings keys with descriptions
SETTINGS_KEYS = {
    "project_name": "Loyiha nomi",
    "logo_url": "Logo URL",
    "admin_username": "Admin username",
    "support_username": "Support username",
    "private_channel_id": "Private kanal ID",
    "free_channel_url": "Bepul kanal URL",
    "instagram_url": "Instagram URL",
    "twitter_url": "Twitter URL",
    "youtube_url": "YouTube URL",
    "website_url": "Website URL",
    "card_number": "Karta raqami",
    "card_owner": "Karta egasi",
    "ton_wallet_address": "TRON TRC20 wallet address",
    "tron_qr_code": "TRON TRC20 wallet QR code (file_id)",
    "bnb_wallet_address": "BNB BEP20 wallet address",
    "bnb_qr_code": "BNB BEP20 wallet QR code (file_id)",
    "stars_1_month": "1 oy Stars narxi",
    "stars_3_month": "3 oy Stars narxi",
    "stars_6_month": "6 oy Stars narxi",
    "price_1_month": "1 oy USD narxi",
    "price_3_month": "3 oy USD narxi",
    "price_6_month": "6 oy USD narxi",
    "course_channel_id": "Darslar kanal ID",
    "course_tariff_name": "Darslar nomi",
    "course_description": "Darslar tavsifi",
    "course_image": "Darslar rasmi (Telegram file_id)",
    "course_price_1_month": "Darslar narxi ($)",
    "course_stars_1_month": "Darslar Stars narxi",
    "welcome_message": "Welcome message",
    "admin_ids": "Admin Telegram IDs (JSON list)",
    "setup_completed": "Setup completed (true/false)",
}

# Keys required for setup wizard (in order)
WIZARD_KEYS = [
    "project_name",
    "admin_username",
    "support_username",
    "private_channel_id",
    "card_number",
    "card_owner",
    "ton_wallet_address",
    "price_1_month",
    "price_3_month",
    "price_6_month",
    "stars_1_month",
    "stars_3_month",
    "stars_6_month",
    "instagram_url",
    "youtube_url",
    "website_url",
    "free_channel_url",
    "course_channel_id",
    "course_tariff_name",
    "course_description",
    "course_image",
    "course_price_1_month",
    "course_stars_1_month",
]


async def get_setting(key: str) -> Optional[str]:
    async with get_session() as session:
        result = await session.execute(
            select(ProjectSettings).where(ProjectSettings.key == key)
        )
        row = result.scalar_one_or_none()
        return row.value if row else None


async def set_setting(key: str, value: str) -> None:
    async with get_session() as session:
        result = await session.execute(
            select(ProjectSettings).where(ProjectSettings.key == key)
        )
        row = result.scalar_one_or_none()
        if row:
            row.value = value
        else:
            desc = SETTINGS_KEYS.get(key, "")
            session.add(ProjectSettings(key=key, value=value, description=desc))


async def is_setup_completed() -> bool:
    val = await get_setting("setup_completed")
    return val == "true"


async def get_admin_ids() -> list[int]:
    """Get admin Telegram IDs from DB settings, fallback to env."""
    val = await get_setting("admin_ids")
    if val:
        try:
            return json.loads(val)
        except (json.JSONDecodeError, ValueError):
            pass
    from bot.config import settings as env_settings
    return env_settings.admin_ids


async def get_all_settings() -> dict[str, str]:
    async with get_session() as session:
        result = await session.execute(select(ProjectSettings))
        rows = result.scalars().all()
        return {row.key: row.value for row in rows}


async def export_settings() -> str:
    settings = await get_all_settings()
    return json.dumps(settings, ensure_ascii=False, indent=2)


async def import_settings(json_str: str) -> None:
    data = json.loads(json_str)
    for key, value in data.items():
        await set_setting(key, str(value))


async def seed_defaults_from_env() -> None:
    """Seed settings from .env if they don't exist yet (first start before wizard)."""
    from bot.config import settings as env_settings

    defaults = {
        "project_name": env_settings.BOT_USERNAME,
        "admin_username": env_settings.ADMIN_LINK,
        "support_username": env_settings.ADMIN_LINK,
        "private_channel_id": env_settings.PRIVATE_CHANNEL_ID,
        "free_channel_url": env_settings.FREE_CHANNEL_LINK,
        "card_number": env_settings.CARD_NUMBER,
        "card_owner": env_settings.CARD_HOLDER,
        "ton_wallet_address": env_settings.TON_WALLET_ADDRESS,
        "tron_qr_code": "",
        "bnb_wallet_address": "",
        "bnb_qr_code": "",
        "price_1_month": "25",
        "price_3_month": "50",
        "price_6_month": "100",
        "stars_1_month": "1250",
        "stars_3_month": "2500",
        "stars_6_month": "5000",
        "course_channel_id": "",
        "course_tariff_name": "Darslar",
        "course_description": "",
        "course_image": "",
        "course_price_1_month": "500",
        "course_stars_1_month": "2500",
        "instagram_url": env_settings.SOCIAL_INSTAGRAM,
        "twitter_url": env_settings.SOCIAL_TWITTER,
        "youtube_url": env_settings.SOCIAL_YOUTUBE,
        "website_url": env_settings.SOCIAL_WEBSITE,
        "welcome_message": "",
        "admin_ids": json.dumps(env_settings.admin_ids),
        "setup_completed": "false",
    }
    for key, value in defaults.items():
        existing = await get_setting(key)
        if not existing:
            await set_setting(key, value)
