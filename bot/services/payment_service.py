from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, func

from bot.database.session import get_session
from bot.models.payment import Payment


async def create_payment(
    user_id: str,
    product_type: str,
    amount: float,
    payment_method: str,
    currency: str = "USD",
    product_id: Optional[str] = None,
    promo_code: Optional[str] = None,
    discount: float = 0,
    photo_file_id: Optional[str] = None,
    telegram_charge_id: Optional[str] = None,
    provider_charge_id: Optional[str] = None,
) -> Payment:
    async with get_session() as session:
        payment = Payment(
            user_id=user_id,
            product_type=product_type,
            product_id=product_id,
            amount=amount,
            currency=currency,
            payment_method=payment_method,
            status="approved" if payment_method == "stars" else "pending",
            promo_code=promo_code,
            discount=discount,
            photo_file_id=photo_file_id,
            telegram_charge_id=telegram_charge_id,
            provider_charge_id=provider_charge_id,
        )
        session.add(payment)
        await session.flush()
        return payment


async def approve_payment(payment_id: str, admin_id: int) -> Optional[Payment]:
    async with get_session() as session:
        result = await session.execute(select(Payment).where(Payment.id == payment_id))
        payment = result.scalar_one_or_none()
        if payment and payment.status == "pending":
            payment.status = "approved"
            payment.reviewed_at = datetime.now(timezone.utc)
            payment.reviewed_by = admin_id
        return payment


async def reject_payment(payment_id: str, admin_id: int) -> Optional[Payment]:
    async with get_session() as session:
        result = await session.execute(select(Payment).where(Payment.id == payment_id))
        payment = result.scalar_one_or_none()
        if payment and payment.status == "pending":
            payment.status = "rejected"
            payment.reviewed_at = datetime.now(timezone.utc)
            payment.reviewed_by = admin_id
        return payment


async def get_pending_payments() -> list[Payment]:
    async with get_session() as session:
        result = await session.execute(
            select(Payment)
            .where(Payment.status == "pending")
            .order_by(Payment.created_at.desc())
        )
        return list(result.scalars().all())


async def get_payment_by_id(payment_id: str) -> Optional[Payment]:
    async with get_session() as session:
        result = await session.execute(select(Payment).where(Payment.id == payment_id))
        return result.scalar_one_or_none()


async def get_payments_by_user(user_id: str) -> list[Payment]:
    async with get_session() as session:
        result = await session.execute(
            select(Payment)
            .where(Payment.user_id == user_id)
            .order_by(Payment.created_at.desc())
        )
        return list(result.scalars().all())


async def get_total_revenue() -> float:
    async with get_session() as session:
        result = await session.execute(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                Payment.status == "approved"
            )
        )
        return float(result.scalar() or 0)


async def get_today_revenue() -> float:
    async with get_session() as session:
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        result = await session.execute(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                Payment.status == "approved",
                Payment.created_at >= today,
            )
        )
        return float(result.scalar() or 0)