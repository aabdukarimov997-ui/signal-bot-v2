"""add invoice_id to payments

Revision ID: 001
Revises:
Create Date: 2026-04-26

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("payments", sa.Column("invoice_id", sa.String(32), nullable=True, unique=True))


def downgrade() -> None:
    op.drop_column("payments", "invoice_id")
