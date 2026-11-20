from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from bot.models.base import Base, BaseMixin


class Payment(BaseMixin, Base):
    __tablename__ = "payments"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_type: Mapped[str] = mapped_column(String(32), nullable=False)  # signal, course
    product_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    invoice_id: Mapped[str | None] = mapped_column(String(32), nullable=True, unique=True)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(16), default="USD")
    payment_method: Mapped[str] = mapped_column(String(32), nullable=False)  # stars, card, check, visa, tron_trc20, bnb
    status: Mapped[str] = mapped_column(String(32), default="pending")  # pending, approved, rejected
    promo_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    discount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)

    # Chek (rasm) uchun
    photo_file_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    admin_message_id: Mapped[int | None] = mapped_column(nullable=True)

    # Stars uchun
    telegram_charge_id: Mapped[str | None] = mapped_column(String(256), nullable=True)
    provider_charge_id: Mapped[str | None] = mapped_column(String(256), nullable=True)

    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_by: Mapped[int | None] = mapped_column(BigInteger, nullable=True)

    # ─── Avtomatik kripto to'lov (TRON TRC20 / BNB BEP20) ───
    # Har bir kripto invoice uchun noyob summa (masalan 25.0137 USDT) — blokcheyndan
    # kelgan tranzaksiyani aynan shu to'lovga bog'lash uchun ishlatiladi.
    crypto_network: Mapped[str | None] = mapped_column(String(16), nullable=True)  # tron, bnb
    crypto_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    crypto_amount: Mapped[float | None] = mapped_column(Numeric(18, 6), nullable=True)
    crypto_tx_hash: Mapped[str | None] = mapped_column(String(128), nullable=True, unique=True, index=True)
    crypto_checked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    auto_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    crypto_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="payments")
