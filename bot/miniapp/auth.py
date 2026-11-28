"""Telegram Web App HMAC authentication. Never trust initDataUnsafe or browser IDs."""

import hashlib
import hmac
import json
import time
from urllib.parse import parse_qsl

from aiogram.types import User


def validate_init_data(raw: str, token: str, *, now: float | None = None, max_age: int = 3600) -> User:
    if not raw or len(raw) > 16384:
        raise ValueError("Telegram orqali qayta oching.")
    pairs = parse_qsl(raw, keep_blank_values=True, strict_parsing=True)
    data = dict(pairs)
    if len(data) != len(pairs):
        raise ValueError("Takrorlangan maydon.")
    signature = data.pop("hash", "")
    check = "\n".join(f"{key}={value}" for key, value in sorted(data.items()))
    secret = hmac.new(b"WebAppData", token.encode(), hashlib.sha256).digest()
    expected = hmac.new(secret, check.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise ValueError("Telegram imzosi noto'g'ri.")
    timestamp = int(data.get("auth_date", "0"))
    age = (time.time() if now is None else now) - timestamp
    if age < -30 or age > max_age:
        raise ValueError("Seans tugadi. Mini App'ni qayta oching.")
    user = User.model_validate(json.loads(data.get("user", "{}")))
    if user.is_bot or user.id <= 0:
        raise ValueError("Foydalanuvchi noto'g'ri.")
    return user
