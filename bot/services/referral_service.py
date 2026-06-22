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


async def get_referrer_by_code(referral_code: str) -> Optional[User]:
    """Find user by referral code (e.g. ref_123456789)."""
    async with get_session() as session:
        result = await session.execute(
            select(User).where(User.referral_code == referral_code)
        )
        return result.scalar_one_or_none()