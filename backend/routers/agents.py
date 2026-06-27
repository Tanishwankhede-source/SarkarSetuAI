from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
from ..core.database import get_db, AsyncSessionLocal
from ..core.auth import get_current_citizen
from ..core.serialization import json_safe
from ..agents.profile_agent import run_profile_agent
from ..agents.discovery_agent import run_discovery_agent
from ..agents.missed_benefits_agent import run_missed_benefits_agent
from ..agents.advocate_agent import run_advocate_agent
from ..agents.voice_assistant_agent import run_voice_assistant
import json

router = APIRouter(prefix="/agents", tags=["agents"])


class DiscoveryRequest(BaseModel):
    force_refresh: bool = False


class AdvocateRequest(BaseModel):
    application_id: str
    rejection_reason: Optional[str] = ""


class VoiceChatRequest(BaseModel):
    message: str
    language_hint: Optional[str] = None


async def full_agent_stream(citizen_id: str):
    """Runs the full agent chain: Profile → Discovery → Missed Benefits."""
    async with AsyncSessionLocal() as db:
        # Step 1: Profile Agent
        yield f"data: {json.dumps({'type': 'agent_start', 'agent': 'profile_agent', 'content': 'Starting Profile Intelligence Agent...'})}\n\n"

        r = await db.execute(text("SELECT * FROM citizen_profiles WHERE citizen_id=:cid"), {"cid": citizen_id})
        row = r.fetchone()
        if row:
            profile_data = json_safe(dict(row._mapping))
            async for event in run_profile_agent(citizen_id, profile_data, db):
                yield event

        # Step 2: Discovery Agent
        yield f"data: {json.dumps({'type': 'agent_start', 'agent': 'discovery_agent', 'content': 'Starting Scheme Discovery Agent...'})}\n\n"
        async for event in run_discovery_agent(citizen_id, db, "onboarding"):
            yield event

        # Step 3: Missed Benefits
        yield f"data: {json.dumps({'type': 'agent_start', 'agent': 'missed_benefits_agent', 'content': 'Starting Missed Benefits Agent...'})}\n\n"
        async for event in run_missed_benefits_agent(citizen_id, db):
            yield event

        yield f"data: {json.dumps({'type': 'all_complete', 'content': 'All agents finished'})}\n\n"


@router.post("/run-discovery")
async def run_discovery(
    req: DiscoveryRequest,
    citizen: dict = Depends(get_current_citizen),
):
    return StreamingResponse(
        full_agent_stream(citizen["id"]),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.post("/advocate")
async def advocate(
    req: AdvocateRequest,
    citizen: dict = Depends(get_current_citizen),
):
    async def stream():
        async with AsyncSessionLocal() as db:
            async for event in run_advocate_agent(
                citizen["id"], req.application_id, req.rejection_reason or "", db
            ):
                yield event

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"}
    )


@router.post("/voice-chat")
async def voice_chat(
    req: VoiceChatRequest,
    citizen: dict = Depends(get_current_citizen),
):
    if not req.message.strip():
        raise HTTPException(400, "Message cannot be empty")

    async def stream():
        async with AsyncSessionLocal() as db:
            async for event in run_voice_assistant(
                citizen["id"], req.message.strip(), req.language_hint, db
            ):
                yield event

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"}
    )


@router.get("/log")
async def get_agent_log(
    limit: int = 20,
    citizen: dict = Depends(get_current_citizen),
    db: AsyncSession = Depends(get_db)
):
    rows = await db.execute(text("""
        SELECT id::text, agent_name, triggered_by, status,
               input_summary, output_summary, reasoning_log,
               tool_calls, started_at, completed_at, duration_ms
        FROM agent_executions
        WHERE citizen_id=:cid
        ORDER BY started_at DESC LIMIT :limit
    """), {"cid": citizen["id"], "limit": limit})
    results = []
    for r in rows.fetchall():
        d = dict(r._mapping)
        if isinstance(d.get("tool_calls"), str):
            d["tool_calls"] = json.loads(d["tool_calls"])
        if d.get("started_at"):
            d["started_at"] = d["started_at"].isoformat()
        if d.get("completed_at"):
            d["completed_at"] = d["completed_at"].isoformat()
        results.append(d)
    return results


@router.get("/status")
async def get_status(citizen: dict = Depends(get_current_citizen), db: AsyncSession = Depends(get_db)):
    r = await db.execute(text("""
        SELECT agent_name, MAX(started_at) as last_run, MAX(status) as last_status
        FROM agent_executions WHERE citizen_id=:cid
        GROUP BY agent_name
    """), {"cid": citizen["id"]})
    agents = []
    for row in r.fetchall():
        d = dict(row._mapping)
        if d.get("last_run"):
            d["last_run"] = d["last_run"].isoformat()
        agents.append(d)
    return {"agents": agents}
