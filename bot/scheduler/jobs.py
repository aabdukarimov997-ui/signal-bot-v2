from aiogram import Bot

from bot.config import settings
from bot.services.subscription_service import (
    expire_all_expired_subscriptions,
    get_expiring_soon,
)
from bot.services.channel_service import ban_channel_member
from bot.utils.texts import (
    REMINDER_7_DAYS,
    REMINDER_3_DAYS,
    REMINDER_1_DAY,
    SUBSCRIPTION_EXPIRED,
)


async def expire_subscriptions_job(bot: Bot) -> None:
    """Expire all overdue subscriptions daily at midnight."""
    expired = await expire_all_expired_subscriptions()
    for sub in expired:
        # Notify user
        from bot.database.session import get_session
        from sqlalchemy import select
        from bot.models.user import User
        async with get_session() as session:
            result = await session.execute(select(User).where(User.id == sub.user_id))
            user = result.scalar_one_or_none()
        if user:
            try:
                await bot.send_message(chat_id=user.telegram_id, text=SUBSCRIPTION_EXPIRED)
                # Remove from channel
                await ban_channel_member(bot, settings.PRIVATE_CHANNEL_ID, user.telegram_id)
            except Exception:
                pass


async def send_expiry_reminders_job(bot: Bot) -> None:
    """Send reminders 7, 3, and 1 day before subscription ends."""
    reminders = {
        7: REMINDER_7_DAYS,
        3: REMINDER_3_DAYS,
        1: REMINDER_1_DAY,
    }
    for days, text in reminders.items():
        subs = await get_expiring_soon(days)
        for sub in subs:
            from bot.database.session import get_session
            from sqlalchemy import select
            from bot.models.user import User
            async with get_session() as session:
                result = await session.execute(select(User).where(User.id == sub.user_id))
                user = result.scalar_one_or_none()
            if user:
                try:
                    await bot.send_message(chat_id=user.telegram_id, text=text)
                except Exception:
                    pass