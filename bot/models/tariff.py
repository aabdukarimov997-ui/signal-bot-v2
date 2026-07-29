from typing import Optional

from sqlalchemy import Boolean, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from bot.models.base import Base, BaseMixin


class SignalTariff(BaseMixin, Base):
    __tablename__ = "signal_tariffs"

    name: Mapped[str] = mapped_column(String(64), nullable=False)
    duration_months: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, default=None)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    product_type: Mapped[str] = mapped_column(String(32), default="signal", nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    channel_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, default=None)

    @property
    def label(self) -> str:
        if self.duration_days:
            days = self.duration_days
            if days == 1:
                return "1 kun"
            elif days == 7:
                return "1 hafta"
            elif days == 14:
                return "2 hafta"
            elif days % 7 == 0:
                return f"{days // 7} hafta"
            return f"{days} kun"
        months_localized = {1: "1 oy", 3: "3 oy", 6: "6 oy"}
        return months_localized.get(self.duration_months, f"{self.duration_months} oy")

    @property
    def stars_price(self) -> int:
        return int(float(self.price) * 50)

    @property
    def duration_display(self) -> str:
        """To'liq muddat matni: '1 kun', '1 oy', '1 hafta' va h.k."""
        if self.duration_days:
            days = self.duration_days
            if days == 1:
                return "1 kun"
            elif days == 7:
                return "1 hafta (7 kun)"
            elif days == 14:
                return "2 hafta (14 kun)"
            elif days % 7 == 0:
                return f"{days // 7} hafta ({days} kun)"
            return f"{days} kun"
        return f"{self.duration_months} oy"