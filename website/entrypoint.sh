#!/bin/sh
set -e

echo "→ Running database migration (creating website schema & tables)..."
prisma db push --skip-generate 2>&1 || {
  echo "⚠️  db push failed, trying with --accept-data-loss..."
  prisma db push --skip-generate --accept-data-loss 2>&1
}

echo "→ Starting Next.js server..."
exec node server.js
