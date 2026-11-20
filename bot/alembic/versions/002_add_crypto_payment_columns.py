"""add crypto auto-payment columns to payments

Revision ID: 002
Revises: 001
Create Date: 2026-11-20

Avtomatik kripto to'lov (TRON TRC20 / BNB BEP20) uchun ustunlar.
Idempotent: mavjud DB'da ustun bo'lmasa qo'shadi (create_all yangi DB'da
allaqachon yaratadi).
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: str | None = "001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

COLUMNS = (
    ("crypto_network", sa.String(16), True),
    ("crypto_address", sa.String(64), True),
    ("crypto_amount", sa.Numeric(18, 6), True),
    ("crypto_tx_hash", sa.String(128), True),
    ("crypto_checked_at", sa.DateTime(timezone=True), True),
    ("auto_approved", sa.Boolean, True),
    ("crypto_expires_at", sa.DateTime(timezone=True), True),
)


def upgrade() -> None:
    from sqlalchemy import inspect

    inspector = inspect(op.get_bind())
    existing = {c["name"] for c in inspector.get_columns("payments")}
    for name, type_, nullable in COLUMNS:
        if name not in existing:
            op.add_column("payments", sa.Column(name, type_, nullable=nullable))

    # crypto_tx_hash bo'yicha tez izlash uchun indeks
    indexes = {i["name"] for i in inspector.get_indexes("payments")}
    if "ix_payments_crypto_tx_hash" not in indexes:
        op.create_index("ix_payments_crypto_tx_hash", "payments", ["crypto_tx_hash"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_payments_crypto_tx_hash", table_name="payments")
    for name, _type, _nullable in reversed(COLUMNS):
        op.drop_column("payments", name)
