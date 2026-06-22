from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from bot.models.base import Base, BaseMixin


class Payment(BaseMixin, Base):
    __tablename__ = "payments"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_type: Mapped[str] = mapped_column(String(32), nullable=False)  # signal, course
    product_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(16), default="USD")
    payment_method: Mapped[str] = mapped_column(String(32), nullable=False)  # stars, card, check
    status: Mapped[str] = mapped_column(String(32), default="pending")  # pending, approved, rejected
    promo_code: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    discount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)

    # Chek (rasm) uchun
    photo_file_id: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    admin_message_id: Mapped[Optional[int]] = mapped_column(nullable=True)

    # Stars uchun
    telegram_charge_id: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    provider_charge_id: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)

    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_by: Mapped[Optional[int]] = mapped_column(nullable=True)

    user = relationship("User", back_populates="payments")