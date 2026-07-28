"""
Telegram Mini App (TMA) constants.
"""

import os

# Base URL of the deployed website:
# 1. Try RAILWAY_STATIC_URL (Railway's auto-assigned domain)
# 2. Fall back to hardcoded if needed
_TMA_HOST = os.environ.get("RAILWAY_STATIC_URL") or os.environ.get("TMA_BASE_URL") or "localhost:3000"
TMA_BASE_URL = f"https://{_TMA_HOST}" if not _TMA_HOST.startswith("http") else _TMA_HOST

# Telegram Mini App URL
TMA_APP_URL = f"{TMA_BASE_URL}/tma"
