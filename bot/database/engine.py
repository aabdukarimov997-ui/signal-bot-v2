from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from bot.config import settings

if settings.DB_TYPE == "sqlite":
    engine = create_async_engine(settings.db_url, echo=False)
else:
    engine = create_async_engine(settings.db_url, pool_size=10, max_overflow=20, echo=False)

async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_async_session() -> AsyncSession:  # type: ignore[misc]
    async with async_session_factory() as session:
        yield session