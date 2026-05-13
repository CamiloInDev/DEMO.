from collections.abc import AsyncGenerator
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

async_engine = create_async_engine(settings.database_url, echo=settings.debug)

# Sync engine para SQLAdmin (usa 'sqlite:///' en vez de 'sqlite+aiosqlite:///')
sync_db_url = settings.database_url.replace("sqlite+aiosqlite:///", "sqlite:///")
sync_engine = create_engine(sync_db_url, echo=settings.debug)

async_session_maker = async_sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
