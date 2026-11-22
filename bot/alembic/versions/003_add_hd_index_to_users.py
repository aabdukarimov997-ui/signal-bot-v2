"""add hd_index to users for per-customer deposit addresses

Revision ID: 003
Revises: 002
Create Date: 2026-11-22

Har bir mijozga alohida kripto depozit manzili berish uchun `users.hd_index`
qo'shiladi. Indeks BIP44 yo'lida ishlatiladi (m/44'/195'/0'/0/{index}).
Idempotent — ustun mavjud bo'lsa qayta qo'shilmaydi.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "003"
down_revision: str | None = "002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    from sqlalchemy import inspect

    inspector = inspect(op.get_bind())
    columns = {c["name"] for c in inspector.get_columns("users")}
    if "hd_index" not in columns:
        op.add_column("users", sa.Column("hd_index", sa.Integer(), nullable=True))

    indexes = {i["name"] for i in inspector.get_indexes("users")}
    if "ix_users_hd_index" not in indexes:
        op.create_index("ix_users_hd_index", "users", ["hd_index"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_users_hd_index", table_name="users")
    op.drop_column("users", "hd_index")
