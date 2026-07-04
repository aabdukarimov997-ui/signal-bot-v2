from datetime import datetime, timedelta, timezone
from typing import Optional

from aiogram import Bot
from aiogram.types import ChatInviteLink


async def create_invite_link(bot: Bot, chat_id: str, member_limit: int = 1) -> Optional[str]:
    """Create a one-time invite link valid for 1 hour."""
    try:
        expire_date = datetime.now(timezone.utc) + timedelta(hours=1)
        link: ChatInviteLink = await bot.create_chat_invite_link(
            chat_id=chat_id,
            member_limit=member_limit,
            expire_date=expire_date,
        )
        return link.invite_link
    except Exception:
        return None


async def get_invite_link(bot: Bot, chat_id: str, fallback_key: str = "invite_link_url") -> Optional[str]:
    """Get invite link — try dynamic first, fall back to DB setting."""
    # Try creating a fresh one-time link
    link = await create_invite_link(bot, chat_id)
    if link:
        return link

    # Fallback: static link from DB settings
    from bot.services.settings_service import get_setting
    invite_url = await get_setting(fallback_key)
    if invite_url:
        return invite_url

    return None


async def get_course_invite_links(bot: Bot) -> list[dict]:
    """Get invite links for all 3 course channels. Returns list of dicts with name, link."""
    from bot.services.settings_service import get_setting

    channels = []
    channel_configs = [
        ("course_channel_id", "course_channel_1_name", "course_invite_link_1"),
        ("course_channel_2_id", "course_channel_2_name", "course_invite_link_2"),
        ("course_channel_3_id", "course_channel_3_name", "course_invite_link_3"),
    ]

    for channel_id_key, name_key, fallback_key in channel_configs:
        channel_id = await get_setting(channel_id_key)
        if not channel_id:
            continue
        channel_name = await get_setting(name_key) or channel_id_key.replace("course_", "").replace("_id", "").replace("_", " ")
        link = await get_invite_link(bot, channel_id, fallback_key=fallback_key)
        if link:
            channels.append({"name": channel_name, "link": link, "channel_id": channel_id})

    return channels


async def ban_channel_member(bot: Bot, chat_id: str, user_id: int) -> bool:
    """Remove user from channel (ban then unban so they can rejoin later)."""
    try:
        await bot.ban_chat_member(chat_id=chat_id, user_id=user_id)
        await bot.unban_chat_member(chat_id=chat_id, user_id=user_id, only_if_banned=True)
        return True
    except Exception:
        return False