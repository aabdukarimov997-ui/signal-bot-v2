"""
Telegram Mini App (TMA) constants.
"""

import os

# Base URL of the deployed website.
# Bot owner must set this env var on the bot's Railway service.
# Example: TMA_BASE_URL=https://signal-website.up.railway.app
#
# If not set, TMA_APP_URL will be empty and the Mini App button won't appear.
TMA_BASE_URL = os.environ.get("TMA_BASE_URL", "")
TMA_APP_URL = f"{TMA_BASE_URL}/tma" if TMA_BASE_URL else ""
