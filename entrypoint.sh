#!/bin/bash
set -e

export PYTHONPATH=/app

echo "🔄 Running Alembic migrations..."
alembic upgrade head || echo "⚠️ No migrations to run (using create_all)"

echo "📥 Seeding old subscribers..."
python seed_subs.py

echo "🚀 Starting bot..."
python -m bot.main
