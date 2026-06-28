from typing import Optional

from sqlalchemy import select, func

from bot.database.session import get_session
from bot.models.user import User


async def get_user_by_telegram_id(telegram_id: int) -> Optional[User]:
    async with get_session() as session:
        result = await session.execute(select(User).where(User.telegram_id == telegram_id))
        return result.scalar_one_or_none()


async def create_user(
    telegram_id: int,
    full_name: str,
    username: Optional[str] = None,
    referred_by: Optional[str] = None,
) -> User:
    async with get_session() as session:
        user = User(
            telegram_id=telegram_id,
            full_name=full_name,
            username=username,
            referral_code=f"ref_{telegram_id}",
            referred_by=referred_by,
        )
        session.add(user)
        await session.flush()
        return user


async def get_or_create_user(
    telegram_id: int,
    full_name: str,
    username: Optional[str] = None,
) -> User:
    user = await get_user_by_telegram_id(telegram_id)
    if user:
        return user
    return await create_user(telegram_id, full_name, username)


async def update_user_activity(telegram_id: int) -> None:
    async with get_session() as session:
        await session.execute(
            User.__table__.update()
            .where(User.telegram_id == telegram_id)
            .values(last_activity=func.now())
        )


async def get_all_users() -> list[User]:
    async with get_session() as session:
        result = await session.execute(select(User).order_by(User.created_at.desc()))
        return list(result.scalars().all())


async def get_user_count() -> int:
    async with get_session() as session:
        result = await session.execute(select(func.count(User.id)))
        return result.scalar() or 0


async def ban_user(telegram_id: int) -> bool:
    async with get_session() as session:
        result = await session.execute(select(User).where(User.telegram_id == telegram_id))
        user = result.scalar_one_or_none()
        if not user:
            return False
        user.is_banned = True
        return True


async def unban_user(telegram_id: int) -> bool:
    async with get_session() as session:
        result = await session.execute(select(User).where(User.telegram_id == telegram_id))
        user = result.scalar_one_or_none()
        if not user:
            return False
        user.is_banned = False
        return True


async def add_referral_bonus_days(user_id: str, days: int) -> None:
    async with get_session() as session:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            user.referral_bonus_days = (user.referral_bonus_days or 0) + days


async def get_all_user_telegram_ids() -> list[int]:
    async with get_session() as session:
        result = await session.execute(
            select(User.telegram_id).where(User.is_banned == False)
        )
        return list(result.scalars().all())