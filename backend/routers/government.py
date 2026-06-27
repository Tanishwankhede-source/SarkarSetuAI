from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from ..core.database import get_db
from ..services.analytics_service import get_overview, get_welfare_gaps, get_scheme_performance

router = APIRouter(prefix="/government", tags=["government"])


@router.get("/overview")
async def overview(db: AsyncSession = Depends(get_db)):
    return await get_overview(db)


@router.get("/welfare-gaps")
async def welfare_gaps(
    state: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await get_welfare_gaps(db, state=state)


@router.get("/scheme-performance")
async def scheme_performance(db: AsyncSession = Depends(get_db)):
    return await get_scheme_performance(db)
