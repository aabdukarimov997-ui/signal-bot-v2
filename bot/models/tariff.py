from typing import Optional

from sqlalchemy import Boolean, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from bot.models.base import Base, BaseMixin


class SignalTariff(BaseMixin, Base):
    __tablename__ = "signal_tariffs"

    name: Mapped[str] = mapped_column(String(64), nullable=False)
    duration_months: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    product_type: Mapped[str] = mapped_column(String(32), default="signal", nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    @property
    def label(self) -> str:
        months_localized = {1: "1 oy", 3: "3 oy", 6: "6 oy"}
        return months_localized.get(self.duration_months, f"{self.duration_months} oy")

    @property
    def stars_price(self) -> int:
        return int(float(self.price) * 50)