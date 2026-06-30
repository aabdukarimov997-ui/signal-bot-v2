import pytest

from bot.database.engine import async_session_factory
from sqlalchemy import select
from bot.models.referral_stat import ReferralStat
from bot.models.user import User


@pytest.mark.asyncio
async def test_referral_link_generation():
    from bot.services.referral_service import get_referral_link
    link = await get_referral_link("test_bot", 12345)
    assert "test_bot" in link
    assert "12345" in link
    assert link.startswith("https://t.me/")


@pytest.mark.asyncio
async def test_add_referral_bonus(sample_user):
    # Create a referred user first
    async with async_session_factory() as session:
        referred = User(telegram_id=99999, full_name="Referred User", referral_code="ref_99999")
        session.add(referred)
        await session.commit()
        await session.refresh(referred)

    from bot.services.referral_service import add_referral_bonus
    stat = await add_referral_bonus(sample_user.id, referred.id, "signal_days", 3)
    assert stat.referrer_id == sample_user.id
    assert stat.referred_id == referred.id
    assert stat.bonus_type == "signal_days"
    assert stat.bonus_value == 3


@pytest.mark.asyncio
async def test_referral_count(sample_user):
    # Create multiple referred users
    async with async_session_factory() as session:
        for i in range(3):
            user = User(telegram_id=111000 + i, full_name=f"Ref {i}", referral_code=f"ref_{111000 + i}")
            session.add(user)
        await session.commit()

        # Get their IDs
        result = await session.execute(
            select(User.id).where(User.telegram_id.in_([111000, 111001, 111002]))
        )
        ids = result.scalars().all()

    from bot.services.referral_service import add_referral_bonus, get_referral_count
    for rid in ids:
        await add_referral_bonus(sample_user.id, rid, "signal_days", 3)

    count = await get_referral_count(sample_user.id)
    assert count >= 3


@pytest.mark.asyncio
async def test_find_referrer_by_code():
    from bot.services.referral_service import get_referrer_by_code
    from bot.services.user_service import get_or_create_user

    user = await get_or_create_user(55555, "Referrer", "referrer_user")
    found = await get_referrer_by_code(f"ref_55555")
    assert found is not None
    assert found.telegram_id == 55555