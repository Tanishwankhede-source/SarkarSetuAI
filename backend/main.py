from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .routers import auth, citizen, benefits, agents, government

app = FastAPI(
    title="SarkarSetu AI",
    description="Citizen Welfare Intelligence Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(citizen.router, prefix="/api/v1")
app.include_router(benefits.router, prefix="/api/v1")
app.include_router(agents.router, prefix="/api/v1")
app.include_router(government.router, prefix="/api/v1")


async def run_migrations() -> None:
    from alembic import command
    from alembic.config import Config
    from pathlib import Path

    base_dir = Path(__file__).resolve().parent
    alembic_cfg = Config(str(base_dir / "alembic.ini"))
    alembic_cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
    alembic_cfg.set_main_option("script_location", str(base_dir / "alembic"))
    command.upgrade(alembic_cfg, "head")


@app.on_event("startup")
async def startup_event() -> None:
    await run_migrations()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "SarkarSetu AI"}
