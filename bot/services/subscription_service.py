from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select, func, and_

from bot.database.session import get_session
from bot.models.subscription import Subscription
from bot.models.tariff import SignalTariff
from bot.models.user import User


async def get_active_subscription(user_id: str) -> Optional[Subscription]:
    async with get_session() as session:
        result = await session.execute(
            select(Subscription).where(
                Subscription.user_id == user_id,
                Subscription.status == "active",
            )
        )
        return result.scalar_one_or_none()


async def create_subscription(
    user_id: str,
    tariff: SignalTariff,
    invite_link: Optional[str] = None,
    bonus_days: int = 0,
) -> Subscription:
    async with get_session() as session:
        now = datetime.now(timezone.utc)
        duration_days = tariff.duration_months * 30 + bonus_days

        sub = Subscription(
            user_id=user_id,
            tariff_id=tariff.id,
            start_date=now,
            end_date=now + timedelta(days=duration_days),
            status="active",
            invite_link=invite_link,
        )
        session.add(sub)
        await session.flush()
        return sub


async def extend_subscription(user_id: str, extra_days: int) -> Optional[Subscription]:
    async with get_session() as session:
        result = await session.execute(
            select(Subscription).where(
                Subscription.user_id == user_id,
                Subscription.status == "active",
            )
        )
        sub = result.scalar_one_or_none()
        if sub:
            sub.end_date = sub.end_date + timedelta(days=extra_days)
        return sub


async def expire_subscription(sub_id: str) -> None:
    async with get_session() as session:
        result = await session.execute(select(Subscription).where(Subscription.id == sub_id))
        sub = result.scalar_one_or_none()
        if sub:
            sub.status = "expired"


async def expire_all_expired_subscriptions() -> list[Subscription]:
    async with get_session() as session:
        now = datetime.now(timezone.utc)
        result = await session.execute(
            select(Subscription).where(
                Subscription.status == "active",
                Subscription.end_date <= now,
            )
        )
        expired = list(result.scalars().all())
        for sub in expired:
            sub.status = "expired"
        return expired


async def get_expiring_soon(days_left: int) -> list[Subscription]:
    async with get_session() as session:
        now = datetime.now(timezone.utc)
        target = now + timedelta(days=days_left)
        result = await session.execute(
            select(Subscription).join(User, Subscription.user_id == User.id).where(
                Subscription.status == "active",
                Subscription.end_date <= target,
                Subscription.end_date > now,
            )
        )
        return list(result.scalars().all())


async def get_all_tariffs() -> list[SignalTariff]:
    async with get_session() as session:
        result = await session.execute(
            select(SignalTariff)
            .where(SignalTariff.is_active == True)
            .order_by(SignalTariff.sort_order, SignalTariff.price)
        )
        return list(result.scalars().all())


async def get_tariff_by_id(tariff_id: str) -> Optional[SignalTariff]:
    async with get_session() as session:
        result = await session.execute(select(SignalTariff).where(SignalTariff.id == tariff_id))
        return result.scalar_one_or_none()


async def get_active_subscription_count() -> int:
    async with get_session() as session:
        result = await session.execute(
            select(func.count(Subscription.id)).where(Subscription.status == "active")
        )
        return result.scalar() or 0


async def ban_user_subscriptions(user_id: str) -> None:
    async with get_session() as session:
        result = await session.execute(
            select(Subscription).where(
                Subscription.user_id == user_id,
                Subscription.status == "active",
            )
        )
        for sub in result.scalars().all():
            sub.status = "cancelled"