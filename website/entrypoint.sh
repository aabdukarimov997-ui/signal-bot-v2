#!/bin/sh
set -e

echo "→ Running database migration (creating website schema & tables)..."
node node_modules/prisma/build/index.js db push --skip-generate 2>&1 || {
  echo "⚠️  db push failed, trying with --accept-data-loss..."
  node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss 2>&1
}

echo "→ Starting Next.js server..."
exec node server.js
