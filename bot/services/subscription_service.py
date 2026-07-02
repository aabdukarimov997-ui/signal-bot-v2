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
            ).order_by(Subscription.end_date.desc())
        )
        return result.scalars().first()


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
            ).order_by(Subscription.end_date.desc())
        )
        sub = result.scalars().first()
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
    """Subs expiring exactly `days_left` days from now (24h window).

    The reminder job runs once a day, so a one-day window means each
    subscription matches each reminder tier (7/3/1) at most once —
    no repeated or overlapping reminders.
    """
    async with get_session() as session:
        now = datetime.now(timezone.utc)
        window_end = now + timedelta(days=days_left)
        window_start = window_end - timedelta(days=1)
        result = await session.execute(
            select(Subscription).join(User, Subscription.user_id == User.id).where(
                Subscription.status == "active",
                Subscription.end_date <= window_end,
                Subscription.end_date > window_start,
            )
        )
        return list(result.scalars().all())


async def get_all_tariffs(product_type: str = "signal") -> list[SignalTariff]:
    async with get_session() as session:
        result = await session.execute(
            select(SignalTariff)
            .where(SignalTariff.is_active == True, SignalTariff.product_type == product_type)
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


async def admin_create_subscription(
    user_id: str,
    duration_days: int,
    price: float,
    product_type: str = "signal",
    invite_link: Optional[str] = None,
) -> Subscription:
    """Admin-only: create subscription with custom duration and price. Hidden from user menus."""
    async with get_session() as session:
        now = datetime.now(timezone.utc)

        tariff_name = f"Admin: {duration_days} kun"
        tariff = SignalTariff(
            name=tariff_name,
            duration_months=max(1, duration_days // 30),
            price=price,
            product_type=product_type,
            is_active=False,
            sort_order=999,
        )
        session.add(tariff)
        await session.flush()

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


async def get_all_subscriptions(status: Optional[str] = None) -> list:
    """Get all subscriptions with user info, optionally filtered by status."""
    async with get_session() as session:
        query = (
            select(Subscription, User)
            .join(User, Subscription.user_id == User.id)
            .order_by(Subscription.end_date.desc())
        )
        if status:
            query = query.where(Subscription.status == status)
        result = await session.execute(query)
        rows = result.all()
        subs = []
        for sub, user_obj in rows:
            sub.telegram_id = user_obj.telegram_id
            sub.user_full_name = user_obj.full_name
            sub.duration_days = (sub.end_date - sub.start_date).days
            subs.append(sub)
        return subs


async def cancel_subscription_by_id(sub_id: str) -> Optional[Subscription]:
    """Cancel a subscription by its ID."""
    async with get_session() as session:
        result = await session.execute(
            select(Subscription).where(Subscription.id == sub_id)
        )
        sub = result.scalar_one_or_none()
        if sub:
            sub.status = "cancelled"
        return sub