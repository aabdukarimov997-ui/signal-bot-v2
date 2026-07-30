#!/bin/sh
set -e

echo "→ Running database migration..."
npx prisma db push --accept-data-loss 2>&1 || echo "⚠️ Migration failed, continuing anyway..."

echo "→ Starting Next.js server..."
exec node server.js
