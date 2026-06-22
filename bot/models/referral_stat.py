from typing import Optional

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from bot.models.base import Base, BaseMixin


class ReferralStat(BaseMixin, Base):
    __tablename__ = "referral_stats"

    referrer_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    referred_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    bonus_type: Mapped[str] = mapped_column(String(32), nullable=False)  # signal_days, course_discount
    bonus_value: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # days or discount %