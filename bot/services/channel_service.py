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


async def get_invite_link(bot: Bot, chat_id: str) -> Optional[str]:
    """Get invite link — try dynamic first, fall back to DB setting."""
    # Try creating a fresh one-time link
    link = await create_invite_link(bot, chat_id)
    if link:
        return link

    # Fallback: static link from DB settings
    from bot.services.settings_service import get_setting
    invite_url = await get_setting("invite_link_url")
    if invite_url:
        return invite_url

    return None


async def ban_channel_member(bot: Bot, chat_id: str, user_id: int) -> bool:
    """Remove user from channel (ban then unban so they can rejoin later)."""
    try:
        await bot.ban_chat_member(chat_id=chat_id, user_id=user_id)
        await bot.unban_chat_member(chat_id=chat_id, user_id=user_id, only_if_banned=True)
        return True
    except Exception:
        return False