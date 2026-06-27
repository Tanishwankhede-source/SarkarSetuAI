from logging.config import fileConfig
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context

# Add backend package root to path so alembic can import core modules.
project_root = Path(__file__).resolve().parents[1]
import sys
sys.path.insert(0, str(project_root))

from core.config import settings
from core.database import Base

config = context.config
fileConfig(config.config_file_name)


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


def run_migrations_offline() -> None:
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=Base.metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    context.configure(connection=connection, target_metadata=Base.metadata)

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    url = settings.DATABASE_URL
    database_url = _strip_sslmode(url)
    connect_args = {"ssl": "require"} if _needs_ssl(url) else {}
    connectable = create_async_engine(database_url, echo=False, connect_args=connect_args)

    async def run_async_migrations() -> None:
        async with connectable.connect() as connection:
            await connection.run_sync(do_run_migrations)

    import asyncio
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
