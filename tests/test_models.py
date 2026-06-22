import pytest

from bot.models.user import User
from bot.models.tariff import SignalTariff
from bot.models.subscription import Subscription
from bot.models.payment import Payment
from bot.models.promo_code import PromoCode
from bot.database.engine import async_session_factory
from sqlalchemy import select


@pytest.mark.asyncio
async def test_create_user():
    from bot.services.user_service import get_or_create_user
    user = await get_or_create_user(111222, "Test User", "testuser")
    assert user.telegram_id == 111222
    assert user.full_name == "Test User"
    assert user.referral_code == "ref_111222"


@pytest.mark.asyncio
async def test_get_existing_user(sample_user):
    from bot.services.user_service import get_user_by_telegram_id
    user = await get_user_by_telegram_id(sample_user.telegram_id)
    assert user is not None
    assert user.id == sample_user.id


@pytest.mark.asyncio
async def test_ban_unban_user(sample_user):
    from bot.services.user_service import ban_user, unban_user, get_user_by_telegram_id

    ok = await ban_user(sample_user.telegram_id)
    assert ok
    user = await get_user_by_telegram_id(sample_user.telegram_id)
    assert user.is_banned

    ok = await unban_user(sample_user.telegram_id)
    assert ok
    user = await get_user_by_telegram_id(sample_user.telegram_id)
    assert not user.is_banned


@pytest.mark.asyncio
async def test_create_tariff(sample_tariff):
    assert sample_tariff.name == "1 oy"
    assert sample_tariff.duration_months == 1
    assert float(sample_tariff.price) == 25
    assert sample_tariff.stars_price == 2500


@pytest.mark.asyncio
async def test_tariff_label(sample_tariff):
    assert sample_tariff.label == "1 oy"


@pytest.mark.asyncio
async def test_get_all_tariffs(sample_tariff):
    from bot.services.subscription_service import get_all_tariffs
    tariffs = await get_all_tariffs()
    assert len(tariffs) >= 1


@pytest.mark.asyncio
async def test_get_tariff_by_id(sample_tariff):
    from bot.services.subscription_service import get_tariff_by_id
    t = await get_tariff_by_id(sample_tariff.id)
    assert t is not None
    assert t.id == sample_tariff.id
    assert t.name == "1 oy"