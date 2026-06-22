import asyncio
import os
import sys

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Patch settings BEFORE any bot module imports
os.environ.setdefault("BOT_TOKEN", "test_bot_token")
os.environ.setdefault("DB_TYPE", "sqlite")
os.environ.setdefault("DB_NAME", "test_db.sqlite")
os.environ.setdefault("DB_HOST", "localhost")
os.environ.setdefault("DB_USER", "test")
os.environ.setdefault("DB_PASSWORD", "test")
os.environ.setdefault("PRIVATE_CHANNEL_ID", "-1001234567890")
os.environ.setdefault("CARD_NUMBER", "8600-0000-0000-0000")
os.environ.setdefault("ADMIN_IDS", "[12345]")
os.environ.setdefault("BOT_USERNAME", "test_bot")

from bot.models.base import Base
from bot.models.user import User
from bot.models.tariff import SignalTariff
from bot.models.subscription import Subscription
from bot.models.payment import Payment
from bot.models.referral_stat import ReferralStat
from bot.models.promo_code import PromoCode


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    from bot.database.engine import engine
    from bot.models.base import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    # Clean up test SQLite file
    import os as _os
    db_path = _os.path.join(_os.path.dirname(__file__), "..", "test_db.sqlite")
    if _os.path.exists(db_path):
        _os.remove(db_path)


@pytest_asyncio.fixture
async def sample_user() -> User:
    from bot.database.engine import async_session_factory
    async with async_session_factory() as session:
        user = User(telegram_id=12345, full_name="Test User", username="testuser")
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


@pytest_asyncio.fixture
async def sample_tariff() -> SignalTariff:
    from bot.database.engine import async_session_factory
    async with async_session_factory() as session:
        tariff = SignalTariff(name="1 oy", duration_months=1, price=25, sort_order=1)
        session.add(tariff)
        await session.commit()
        await session.refresh(tariff)
        return tariff


@pytest_asyncio.fixture
async def sample_promo() -> PromoCode:
    from bot.database.engine import async_session_factory
    async with async_session_factory() as session:
        promo = PromoCode(
            code="TEST10",
            discount_percent=10,
            max_uses=50,
            product_type="signal",
            is_active=True,
        )
        session.add(promo)
        await session.commit()
        await session.refresh(promo)
        return promo