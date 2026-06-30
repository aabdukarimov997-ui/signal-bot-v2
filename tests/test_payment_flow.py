import pytest

from bot.database.engine import async_session_factory
from sqlalchemy import select
from bot.models.payment import Payment


@pytest.mark.asyncio
async def test_create_stars_payment(sample_user, sample_tariff):
    from bot.services.payment_service import create_payment

    payment = await create_payment(
        user_id=sample_user.id,
        product_type="signal",
        product_id=sample_tariff.id,
        amount=25.0,
        payment_method="stars",
        telegram_charge_id="charge_123",
    )
    assert payment.status == "approved"  # Stars are auto-approved
    assert payment.payment_method == "stars"
    assert float(payment.amount) == 25.0


@pytest.mark.asyncio
async def test_create_card_payment(sample_user, sample_tariff):
    from bot.services.payment_service import create_payment

    payment = await create_payment(
        user_id=sample_user.id,
        product_type="signal",
        product_id=sample_tariff.id,
        amount=25.0,
        payment_method="check",
        photo_file_id="AgACAgIAA...",
    )
    assert payment.status == "pending"
    assert payment.photo_file_id == "AgACAgIAA..."


@pytest.mark.asyncio
async def test_approve_payment(sample_user, sample_tariff):
    from bot.services.payment_service import create_payment, approve_payment

    payment = await create_payment(
        user_id=sample_user.id,
        product_type="signal",
        product_id=sample_tariff.id,
        amount=25.0,
        payment_method="check",
    )
    approved = await approve_payment(payment.id, 99999)
    assert approved is not None
    assert approved.status == "approved"
    assert approved.reviewed_by == 99999
    assert approved.reviewed_at is not None


@pytest.mark.asyncio
async def test_reject_payment(sample_user, sample_tariff):
    from bot.services.payment_service import create_payment, reject_payment

    payment = await create_payment(
        user_id=sample_user.id,
        product_type="signal",
        product_id=sample_tariff.id,
        amount=25.0,
        payment_method="check",
    )
    rejected = await reject_payment(payment.id, 99999)
    assert rejected is not None
    assert rejected.status == "rejected"


@pytest.mark.asyncio
async def test_get_pending_payments(sample_user, sample_tariff):
    from bot.services.payment_service import create_payment, get_pending_payments

    await create_payment(user_id=sample_user.id, product_type="signal",
                         product_id=sample_tariff.id, amount=25.0, payment_method="check")
    await create_payment(user_id=sample_user.id, product_type="signal",
                         product_id=sample_tariff.id, amount=25.0, payment_method="check")

    pending = await get_pending_payments()
    assert len(pending) >= 2


@pytest.mark.asyncio
async def test_payment_with_promo(sample_user, sample_tariff, sample_promo):
    from bot.services.payment_service import create_payment

    discounted = 25.0 * 0.9
    payment = await create_payment(
        user_id=sample_user.id,
        product_type="signal",
        product_id=sample_tariff.id,
        amount=discounted,
        payment_method="stars",
        promo_code=sample_promo.code,
        discount=2.5,
    )
    assert payment.promo_code == "TEST10"
    assert float(payment.discount) == 2.5
    assert float(payment.amount) == discounted


@pytest.mark.asyncio
async def test_revenue_calculation(sample_user, sample_tariff):
    from bot.services.payment_service import (
        create_payment, approve_payment, get_total_revenue
    )

    p1 = await create_payment(
        user_id=sample_user.id, product_type="signal",
        product_id=sample_tariff.id, amount=25.0, payment_method="check",
    )
    p2 = await create_payment(
        user_id=sample_user.id, product_type="signal",
        product_id=sample_tariff.id, amount=50.0, payment_method="check",
    )

    await approve_payment(p1.id, 99999)
    await approve_payment(p2.id, 99999)

    revenue = await get_total_revenue()
    assert revenue >= 75.0