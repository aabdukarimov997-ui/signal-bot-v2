#!/bin/bash
set -e

export PYTHONPATH=/app

# ─── Database migration ──────────────────────────────────────────
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
