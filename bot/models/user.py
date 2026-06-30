from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, BigInteger, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from bot.models.base import Base, BaseMixin


class User(BaseMixin, Base):
    __tablename__ = "users"

    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False, index=True)
    username: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    full_name: Mapped[str] = mapped_column(String(256), nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="uz")
    is_banned: Mapped[bool] = mapped_column(Boolean, default=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    referral_code: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True)
    referred_by: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    referral_bonus_days: Mapped[int] = mapped_column(Integer, default=0)

    phone_number: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    last_activity: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    subscriptions = relationship("Subscription", back_populates="user", lazy="selectin")
    payments = relationship("Payment", back_populates="user", lazy="selectin")