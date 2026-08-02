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


async def get_active_subscription_by_type(user_id: str, product_type: str = "course") -> Optional[Subscription]:
    async with get_session() as session:
        result = await session.execute(
            select(Subscription)
            .join(SignalTariff, Subscription.tariff_id == SignalTariff.id)
            .where(
                Subscription.user_id == user_id,
                Subscription.status == "active",
                SignalTariff.product_type == product_type,
            )
            .order_by(Subscription.end_date.desc())
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
        if tariff.duration_days is not None:
            duration_days = tariff.duration_days + bonus_days
        else:
            duration_days = tariff.duration_months * 30 + bonus_days

        # Check if user already has an active subscription of the same product type
        existing = await session.execute(
            select(Subscription)
            .join(SignalTariff, Subscription.tariff_id == SignalTariff.id)
            .where(
                Subscription.user_id == user_id,
                Subscription.status == "active",
                SignalTariff.product_type == tariff.product_type,
            )
            .order_by(Subscription.end_date.desc())
        )
        existing_sub = existing.scalars().first()

        if existing_sub:
            # Extend existing subscription (add days to current end_date)
            # Eslatma flaglarini RESET qilamiz — yangi muddat bo'yicha
            # eslatmalar qayta hisoblansin (7/3/1 kun qolganda 1 martadan)
            # Bazani max(now, end_date) qilamiz — end_date o'tib ketgan bo'lsa
            # (eski aktiv qator, hali expire bo'lmagan) kunlardan yutqazmaslik uchun
            base = max(now, existing_sub.end_date)
            existing_sub.end_date = base + timedelta(days=duration_days)
            existing_sub.reminder_7_sent = False
            existing_sub.reminder_3_sent = False
            existing_sub.reminder_1_sent = False
            return existing_sub

        # Create new subscription
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
            # Bazani max(now, end_date) qilamiz — end_date o'tib ketgan bo'lsa
            # foydalanuvchi kunlardan yutqazmasligi uchun
            base = max(datetime.now(timezone.utc), sub.end_date)
            sub.end_date = base + timedelta(days=extra_days)
            # Eslatma flaglarini reset qilamiz — yangi muddat bo'yicha hisoblansin
            sub.reminder_7_sent = False
            sub.reminder_3_sent = False
            sub.reminder_1_sent = False
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


async def get_expiring_soon(days_left: int, days_min: int = 0) -> list[Subscription]:
    async with get_session() as session:
        now = datetime.now(timezone.utc)
        target_max = now + timedelta(days=days_left)
        target_min = now + timedelta(days=days_min)
        result = await session.execute(
            select(Subscription)
            .join(User, Subscription.user_id == User.id)
            .outerjoin(SignalTariff, Subscription.tariff_id == SignalTariff.id)
            .where(
                Subscription.status == "active",
                Subscription.end_date <= target_max,
                Subscription.end_date > target_min,
            )
            # Dublikat aktiv qatorlarni oldini olish: har bir (user, product_type) uchun
            # FAQAT eng oxirgi muddatli obuna qaytariladi — eski qator eslatma trigger qilmaydi
            .distinct(User.id, SignalTariff.product_type)
            .order_by(User.id, SignalTariff.product_type, Subscription.end_date.desc())
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


async def get_all_subscriptions(status: str = "active") -> list[Subscription]:
    async with get_session() as session:
        result = await session.execute(
            select(Subscription).where(Subscription.status == status)
        )
        return list(result.scalars().all())


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