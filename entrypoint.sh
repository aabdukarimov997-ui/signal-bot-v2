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

# ─── Railway Healthcheck server ───────────────────────────────────
# Railway needs an HTTP endpoint to consider the service healthy.
# We start a lightweight healthcheck alongside the bot.
echo "🌐 Starting healthcheck server on port ${PORT:-8080}..."

# Start healthcheck in background
python -m bot.healthcheck &
HEALTH_PID=$!

echo "🚀 Starting bot..."
python -m bot.main &
BOT_PID=$!

# ─── Handle shutdown ───────────────────────────────────────────────
cleanup() {
    echo "🛑 Shutting down..."
    kill $BOT_PID 2>/dev/null
    kill $HEALTH_PID 2>/dev/null
    wait
}
trap cleanup SIGINT SIGTERM

# Wait for any process to exit
wait -n
# If one exits, kill the other and exit
echo "⚠️ A process exited — shutting down all services"
kill $BOT_PID 2>/dev/null
kill $HEALTH_PID 2>/dev/null
wait
exit 1
