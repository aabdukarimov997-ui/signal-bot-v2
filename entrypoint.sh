#!/bin/bash
set -e

export PYTHONPATH=/app

# ─── Database migration ──────────────────────────────────────────
# 1. Create all tables (idempotent) so a fresh DB works on first boot.
#    This must run BEFORE alembic, because migration 001 assumes the
#    base tables already exist.
echo "🔄 Ensuring tables exist (create_all)..."
python -c "
import asyncio
import bot.models  # noqa: F401 — register all models on Base.metadata
from bot.database.engine import engine
from bot.models.base import Base

async def _create_all():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

asyncio.run(_create_all())
" || echo "⚠️ create_all failed — continuing (bot.main will retry)"

# 2. Run incremental migrations (idempotent, see 001_add_invoice_id)
echo "🔄 Running Alembic migrations..."
alembic upgrade head || echo "⚠️ No migrations to run (using create_all)"

# HTTP health checks and Mini App share the bot process and its Dispatcher/FSM.
# Do not launch bot.healthcheck separately: it would occupy the same $PORT.
echo "🚀 Starting bot + Mini App on port ${PORT:-8080}..."
exec python -m bot.main
