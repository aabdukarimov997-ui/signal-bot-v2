from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

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
    TRON_WALLET_ADDRESS: str = ""
    BNB_WALLET_ADDRESS: str = ""

    # HD hamyon — har bir mijozga alohida depozit manzili (faqat xpub!)
    TRON_HD_XPUB: str = ""
    BNB_HD_XPUB: str = ""

    # Kripto avtomatik to'lov (blokcheyndan tekshirish)
    CRYPTO_AUTO_ENABLED: bool = True
    CRYPTO_POLL_SECONDS: int = 60
    TRON_USDT_CONTRACT: str = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
    BNB_USDT_CONTRACT: str = "0x55d398326f99059fF775485246999027B3197955"
    BSC_RPC_URL: str = "https://bsc-dataseed.binance.org"
    TRONGRID_API_KEY: str = ""
    PROJECT_CRYPTO_PAY_TOKEN: str = ""
    PROJECT_CRYPTO_PAY_TESTNET: bool = False

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
            parts = urlsplit(url)
            query = dict(parse_qsl(parts.query))
            # libpq uses sslmode; asyncpg accepts the equivalent ssl option.
            mode = query.pop("sslmode", None)
            if mode is not None:
                query.setdefault("ssl", mode)
            url = urlunsplit(parts._replace(query=urlencode(query)))
            return url
        if self.DB_TYPE == "sqlite":
            return f"sqlite+aiosqlite:///{self.DB_NAME}"
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def db_url_sync(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+psycopg2://", 1)
            elif url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
            elif url.startswith("postgresql+asyncpg://"):
                url = url.replace("postgresql+asyncpg://", "postgresql+psycopg2://", 1)
            return url
        if self.DB_TYPE == "sqlite":
            return f"sqlite:///{self.DB_NAME}"
        return f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


settings = Settings()
