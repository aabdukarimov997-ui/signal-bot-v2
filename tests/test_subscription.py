import pytest
from datetime import datetime, timedelta, timezone

from bot.models.subscription import Subscription
from bot.database.engine import async_session_factory
from sqlalchemy import select


@pytest.mark.asyncio
async def test_create_subscription(sample_user, sample_tariff):
    from bot.services.subscription_service import create_subscription

    sub = await create_subscription(sample_user.id, sample_tariff)
    assert sub.user_id == sample_user.id
    assert sub.tariff_id == sample_tariff.id
    assert sub.status == "active"
    assert sub.end_date > sub.start_date

    # Verify duration is approximately 30 days
    diff = sub.end_date - sub.start_date
    assert diff.days == 30


@pytest.mark.asyncio
async def test_create_subscription_with_bonus(sample_user, sample_tariff):
    from bot.services.subscription_service import create_subscription

    sub = await create_subscription(sample_user.id, sample_tariff, bonus_days=3)
    diff = sub.end_date - sub.start_date
    assert diff.days == 33


@pytest.mark.asyncio
async def test_get_active_subscription(sample_user, sample_tariff):
    from bot.services.subscription_service import create_subscription, get_active_subscription

    sub = await create_subscription(sample_user.id, sample_tariff)
    active = await get_active_subscription(sample_user.id)
    assert active is not None
    assert active.id == sub.id


@pytest.mark.asyncio
async def test_expire_subscription(sample_user, sample_tariff):
    from bot.services.subscription_service import create_subscription, expire_subscription

    sub = await create_subscription(sample_user.id, sample_tariff)
    await expire_subscription(sub.id)

    from bot.services.subscription_service import get_active_subscription
    active = await get_active_subscription(sample_user.id)
    assert active is None


@pytest.mark.asyncio
async def test_expire_all_expired_subscriptions(sample_user, sample_tariff):
    from bot.services.subscription_service import create_subscription, expire_all_expired_subscriptions
    from bot.database.engine import async_session_factory

    # Create a subscription with past end_date
    async with async_session_factory() as session:
        past = datetime.now(timezone.utc) - timedelta(days=10)
        sub = Subscription(
            user_id=sample_user.id,
            tariff_id=sample_tariff.id,
            start_date=past - timedelta(days=30),
            end_date=past,
            status="active",
        )
        session.add(sub)
        await session.commit()

    expired = await expire_all_expired_subscriptions()
    assert len(expired) >= 1
    for s in expired:
        assert s.status == "expired"


@pytest.mark.asyncio
async def test_extend_subscription(sample_user, sample_tariff):
    from bot.services.subscription_service import create_subscription, extend_subscription
    from datetime import timezone as tz

    sub = await create_subscription(sample_user.id, sample_tariff)
    original_end = sub.end_date
    if original_end.tzinfo is None:
        original_end = original_end.replace(tzinfo=tz.utc)
    extended = await extend_subscription(sample_user.id, 7)
    assert extended is not None
    if extended.end_date.tzinfo is None:
        extended.end_date = extended.end_date.replace(tzinfo=tz.utc)
    assert extended.end_date > original_end
    diff = (extended.end_date - original_end).days
    assert diff == 7