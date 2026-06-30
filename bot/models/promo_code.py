from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from bot.models.base import Base, BaseMixin


class PromoCode(BaseMixin, Base):
    __tablename__ = "promocodes"

    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    discount_percent: Mapped[int] = mapped_column(Integer, nullable=False)
    max_uses: Mapped[int] = mapped_column(Integer, default=0)
    current_uses: Mapped[int] = mapped_column(Integer, default=0)
    product_type: Mapped[str] = mapped_column(String(32), nullable=False)  # signal, course, all
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)