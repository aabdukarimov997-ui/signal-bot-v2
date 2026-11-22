from sqlalchemy import BigInteger, Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from bot.models.base import Base, BaseMixin


class QuizResult(BaseMixin, Base):
    """Viktorina natijasi — foydalanuvchi savollarga qanday javob bergani."""

    __tablename__ = "quiz_results"

    user_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(256), nullable=False)

    score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    percent: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    passed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    promo_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
