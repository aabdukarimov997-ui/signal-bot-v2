from datetime import UTC, datetime, timedelta

import pytest

from bot.database.engine import async_session_factory
from bot.models.subscription import Subscription
from bot.models.tariff import SignalTariff


async def _make_subscription(user_id: str, tariff_id: str, days: int = 30, status: str = "active") -> None:
    async with async_session_factory() as session:
        now = datetime.now(UTC)
        session.add(
            Subscription(
                user_id=user_id,
                tariff_id=tariff_id,
                start_date=now,
                end_date=now + timedelta(days=days),
                status=status,
            )
        )
        await session.commit()


async def _make_tariff(product_type: str, price: float = 100) -> SignalTariff:
    async with async_session_factory() as session:
        tariff = SignalTariff(
            name=f"{product_type}-tariff",
            duration_months=1,
            price=price,
            sort_order=1,
            product_type=product_type,
        )
        session.add(tariff)
        await session.commit()
        await session.refresh(tariff)
        return tariff


@pytest.mark.asyncio
async def test_no_discount_without_subscription(sample_user):
    from bot.services.pricing_service import build_price

    price = await build_price(sample_user.id, 100.0, "signal")
    assert price.final == 100.0
    assert price.discount_percent == 0
    assert not price.has_discount


@pytest.mark.asyncio
async def test_discount_for_active_subscriber(sample_user):
    from bot.services.pricing_service import build_price

    tariff = await _make_tariff("signal")
    await _make_subscription(sample_user.id, tariff.id)

    price = await build_price(sample_user.id, 100.0, "signal")
    assert price.base == 100.0
    assert price.discount_percent == 25
    assert price.final == 75.0
    assert price.saved == 25.0
    assert price.has_discount


@pytest.mark.asyncio
async def test_discount_only_for_same_product_type(sample_user):
    from bot.services.pricing_service import build_price

    tariff = await _make_tariff("signal")
    await _make_subscription(sample_user.id, tariff.id)

    course_price = await build_price(sample_user.id, 100.0, "course")
    assert course_price.final == 100.0
    assert course_price.discount_percent == 0


@pytest.mark.asyncio
async def test_expired_subscription_gets_no_discount(sample_user):
    from bot.services.pricing_service import build_price

    tariff = await _make_tariff("signal")
    await _make_subscription(sample_user.id, tariff.id, days=-1)

    price = await build_price(sample_user.id, 100.0, "signal")
    assert price.final == 100.0
    assert price.discount_percent == 0


@pytest.mark.asyncio
async def test_custom_discount_percent(sample_user, sample_tariff):
    from bot.services.pricing_service import build_price
    from bot.services.settings_service import set_setting

    await set_setting("loyalty_discount_percent", "10")
    try:
        await _make_subscription(sample_user.id, sample_tariff.id)
        price = await build_price(sample_user.id, 100.0, "signal")
        assert price.discount_percent == 10
        assert price.final == 90.0
    finally:
        await set_setting("loyalty_discount_percent", "25")


@pytest.mark.asyncio
async def test_rounding_of_discounted_price(sample_user, sample_tariff):
    from bot.services.pricing_service import build_price

    await _make_subscription(sample_user.id, sample_tariff.id)
    price = await build_price(sample_user.id, 25.0, "signal")
    assert price.final == 18.75
    assert price.saved == 6.25


def test_price_formatting_helpers():
    from bot.services.pricing_service import Price

    discounted = Price(base=25.0, final=18.75, discount_percent=25)
    assert discounted.format_final() == "$18.75"
    assert discounted.format_base() == "$25"
    assert "-25%" in discounted.button_label()
    assert "18.75" in discounted.format_html()

    plain = Price(base=25.0, final=25.0, discount_percent=0)
    assert plain.format_final() == "$25"
    assert not plain.has_discount
