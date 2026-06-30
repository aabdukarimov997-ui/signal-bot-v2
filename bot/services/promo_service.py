from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select

from bot.database.session import get_session
from bot.models.promo_code import PromoCode


async def validate_promo(code: str, product_type: str) -> Optional[PromoCode]:
    async with get_session() as session:
        result = await session.execute(
            select(PromoCode).where(
                PromoCode.code == code.upper(),
                PromoCode.is_active == True,
            )
        )
        promo = result.scalar_one_or_none()
        if not promo:
            return None
        if promo.max_uses > 0 and promo.current_uses >= promo.max_uses:
            return None
        if promo.expires_at and promo.expires_at < datetime.now(timezone.utc):
            return None
        if promo.product_type != "all" and promo.product_type != product_type:
            return None
        return promo


async def apply_promo(promo: PromoCode) -> None:
    async with get_session() as session:
        result = await session.execute(select(PromoCode).where(PromoCode.id == promo.id))
        p = result.scalar_one_or_none()
        if p:
            p.current_uses += 1