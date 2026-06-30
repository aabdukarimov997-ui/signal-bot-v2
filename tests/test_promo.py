import pytest

from bot.database.engine import async_session_factory
from sqlalchemy import select
from bot.models.promo_code import PromoCode


@pytest.mark.asyncio
async def test_validate_valid_promo(sample_promo):
    from bot.services.promo_service import validate_promo
    promo = await validate_promo("TEST10", "signal")
    assert promo is not None
    assert promo.code == "TEST10"
    assert promo.discount_percent == 10


@pytest.mark.asyncio
async def test_validate_invalid_code():
    from bot.services.promo_service import validate_promo
    promo = await validate_promo("INVALID", "signal")
    assert promo is None


@pytest.mark.asyncio
async def test_validate_wrong_product_type(sample_promo):
    from bot.services.promo_service import validate_promo
    promo = await validate_promo("TEST10", "course")
    assert promo is None  # sample_promo is signal-only


@pytest.mark.asyncio
async def test_validate_case_insensitive(sample_promo):
    from bot.services.promo_service import validate_promo
    promo = await validate_promo("test10", "signal")
    assert promo is not None
    assert promo.code == "TEST10"


@pytest.mark.asyncio
async def test_apply_promo_increments_uses(sample_promo):
    from bot.services.promo_service import apply_promo, validate_promo

    original_uses = sample_promo.current_uses
    await apply_promo(sample_promo)

    # Validate again to check current_uses was incremented
    async with async_session_factory() as session:
        result = await session.execute(
            select(PromoCode).where(PromoCode.id == sample_promo.id)
        )
        updated = result.scalar_one()
        assert updated.current_uses == original_uses + 1


@pytest.mark.asyncio
async def test_promo_max_uses_exhausted():
    from bot.services.promo_service import validate_promo
    from bot.database.engine import async_session_factory

    # Create a promo with max_uses already reached
    async with async_session_factory() as session:
        promo = PromoCode(
            code="FULL",
            discount_percent=20,
            max_uses=5,
            current_uses=5,
            product_type="all",
            is_active=True,
        )
        session.add(promo)
        await session.commit()
        await session.refresh(promo)

    result = await validate_promo("FULL", "signal")
    assert result is None


@pytest.mark.asyncio
async def test_promo_inactive():
    from bot.services.promo_service import validate_promo
    from bot.database.engine import async_session_factory

    async with async_session_factory() as session:
        promo = PromoCode(
            code="INACTIVE",
            discount_percent=15,
            product_type="all",
            is_active=False,
        )
        session.add(promo)
        await session.commit()

    result = await validate_promo("INACTIVE", "signal")
    assert result is None