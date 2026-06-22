from bot.database.session import get_session
from bot.models.tariff import SignalTariff
from bot.models.promo_code import PromoCode
from sqlalchemy import select, func


async def seed() -> None:
    """Seed initial data — tariffs and promo codes."""
    async with get_session() as session:
        # Check if tariffs exist
        result = await session.execute(select(func.count(SignalTariff.id)))
        count = result.scalar() or 0

        if count == 0:
            tariffs = [
                SignalTariff(name="1 oy", duration_months=1, price=25, sort_order=1),
                SignalTariff(name="3 oy", duration_months=3, price=50, sort_order=2),
                SignalTariff(name="6 oy", duration_months=6, price=100, sort_order=3),
            ]
            session.add_all(tariffs)
            print("✅ Default tariffs seeded")

        # Check if promo codes exist
        result = await session.execute(select(func.count(PromoCode.id)))
        pcount = result.scalar() or 0

        if pcount == 0:
            session.add(PromoCode(
                code="WELCOME10",
                discount_percent=10,
                max_uses=100,
                product_type="signal",
            ))
            print("✅ Default promo code seeded")


if __name__ == "__main__":
    import asyncio
    asyncio.run(seed())