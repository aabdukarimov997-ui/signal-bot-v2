#!/bin/bash
set -e

export PYTHONPATH=/app

echo "🔄 Running Alembic migrations..."
alembic upgrade head || echo "⚠️ No migrations to run (using create_all)"

echo "🚀 Starting bot..."
python -m bot.main
