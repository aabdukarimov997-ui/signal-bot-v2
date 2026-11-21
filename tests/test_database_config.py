from urllib.parse import parse_qs, urlsplit

from bot.config import Settings


def test_asyncpg_sslmode_translation():
    config = Settings(BOT_TOKEN="test", DATABASE_URL="postgresql://user:pass@db/test?sslmode=require")
    assert urlsplit(config.db_url).scheme == "postgresql+asyncpg"
    assert parse_qs(urlsplit(config.db_url).query) == {"ssl": ["require"]}
    assert "sslmode=require" in config.db_url_sync
    assert urlsplit(config.db_url_sync).scheme == "postgresql+psycopg2"


def test_asyncpg_preserves_existing_ssl():
    config = Settings(BOT_TOKEN="test", DATABASE_URL="postgres://user:pass@db/test?ssl=require")
    assert parse_qs(urlsplit(config.db_url).query) == {"ssl": ["require"]}
