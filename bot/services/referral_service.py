from typing import Optional

from sqlalchemy import select, func

from bot.database.session import get_session
from bot.models.referral_stat import ReferralStat
from bot.models.user import User


async def get_referral_link(bot_username: str, telegram_id: int) -> str:
    return f"https://t.me/{bot_username}?start={telegram_id}"


async def add_referral_bonus(
    referrer_id: str,
    referred_id: str,
    bonus_type: str,
    bonus_value: Optional[int] = None,
) -> ReferralStat:
    async with get_session() as session:
        stat = ReferralStat(
            referrer_id=referrer_id,
            referred_id=referred_id,
            bonus_type=bonus_type,
            bonus_value=bonus_value,
        )
        session.add(stat)
        await session.flush()
        return stat


async def get_referral_count(user_id: str) -> int:
    async with get_session() as session:
        result = await session.execute(
            select(func.count(ReferralStat.id)).where(ReferralStat.referrer_id == user_id)
        )
        return result.scalar() or 0


async def get_referral_active_signal_count(telegram_id: int) -> int:
    """Count how many referred users have an active signal subscription."""
    from bot.models.subscription import Subscription
    from datetime import datetime

    async with get_session() as session:
        # Find all users referred by this telegram_id
        result = await session.execute(
            select(User).where(User.referred_by == f"ref_{telegram_id}")
        )
        referred_users = result.scalars().all()
        if not referred_users:
            return 0

        referred_user_ids = [u.id for u in referred_users]
        # Count referred users with at least one active signal subscription
        active_count = await session.execute(
            select(func.count(func.distinct(Subscription.user_id))).where(
                Subscription.user_id.in_(referred_user_ids),
                Subscription.product_type == "signal",
                Subscription.status == "active",
                Subscription.end_date > datetime.utcnow()
            )
        )
        return active_count.scalar() or 0