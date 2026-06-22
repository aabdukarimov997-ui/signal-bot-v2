from typing import Optional

from aiogram import Bot
from aiogram.types import ChatInviteLink


async def create_invite_link(bot: Bot, chat_id: str, member_limit: int = 1) -> Optional[str]:
    """Create a one-time invite link valid for 24 hours."""
    try:
        link: ChatInviteLink = await bot.create_chat_invite_link(
            chat_id=chat_id,
            member_limit=member_limit,
            expire_date=None,  # 24h is default for Telegram
        )
        return link.invite_link
    except Exception:
        return None


async def ban_channel_member(bot: Bot, chat_id: str, user_id: int) -> bool:
    """Ban (and unban) user from channel to remove access."""
    try:
        await bot.ban_chat_member(chat_id=chat_id, user_id=user_id)
        await bot.unban_chat_member(chat_id=chat_id, user_id=user_id)
        return True
    except Exception:
        return False