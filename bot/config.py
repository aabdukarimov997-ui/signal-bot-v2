from __future__ import annotations

import json
import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    BOT_TOKEN: str
    BOT_USERNAME: str = ""

    DB_TYPE: str = "postgresql"
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "signal_bot"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""
    DATABASE_URL: str = ""

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    PRIVATE_CHANNEL_ID: str = ""
    FREE_CHANNEL_LINK: str = ""
    INVITE_LINK_URL: str = ""

    CARD_NUMBER: str = ""
    CARD_HOLDER: str = ""

    TON_WALLET_ADDRESS: str = ""
    BNB_WALLET_ADDRESS: str = ""

    ADMIN_IDS: str = "[]"
    ADMIN_LINK: str = "@admin"

    SOCIAL_INSTAGRAM: str = ""
    SOCIAL_TWITTER: str = ""
    SOCIAL_YOUTUBE: str = ""
    SOCIAL_WEBSITE: str = ""

    @property
    def admin_ids(self) -> list[int]:
        return json.loads(self.ADMIN_IDS)

    @property
    def db_url(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return url
        if self.DB_TYPE == "sqlite":
            return f"sqlite+aiosqlite:///{self.DB_NAME}"
        return (
            f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    @property
    def db_url_sync(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if "+asyncpg" in url:
                url = url.replace("+asyncpg", "")
            return url
        if self.DB_TYPE == "sqlite":
            return f"sqlite:///{self.DB_NAME}"
        return (
            f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )


settings = Settings()