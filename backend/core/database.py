from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from .config import settings


def _strip_sslmode(url: str) -> str:
    parsed = urlparse(url)
    if not parsed.query:
        return url

    params = [(k, v) for k, v in parse_qsl(parsed.query, keep_blank_values=True) if k.lower() != "sslmode"]
    if len(params) == len(parse_qsl(parsed.query, keep_blank_values=True)):
        return url

    return urlunparse(parsed._replace(query=urlencode(params)))


def _needs_ssl(url: str) -> bool:
    parsed = urlparse(url)
    if not parsed.query:
        return False
    return any(k.lower() == "sslmode" and v.lower() == "require" for k, v in parse_qsl(parsed.query, keep_blank_values=True))


database_url = _strip_sslmode(settings.DATABASE_URL)
connect_args = {"ssl": "require"} if _needs_ssl(settings.DATABASE_URL) else {}
engine = create_async_engine(database_url, echo=False, pool_pre_ping=True, connect_args=connect_args)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
