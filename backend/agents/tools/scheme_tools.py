"""Tools for scheme lookup and eligibility checking used by agents."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import json


async def get_all_active_schemes(db: AsyncSession) -> list:
    rows = await db.execute(text("""
        SELECT id::text, slug, name_en, category, ministry, level,
               eligibility_criteria, benefit_description, benefit_value_annual,
               benefit_type, required_documents, application_url, description_en
        FROM schemes WHERE is_active=true ORDER BY benefit_value_annual DESC NULLS LAST
    """))
    results = []
    for r in rows.fetchall():
        row = dict(r._mapping)
        # eligibility_criteria may come back as string or dict
        if isinstance(row.get("eligibility_criteria"), str):
            row["eligibility_criteria"] = json.loads(row["eligibility_criteria"])
        if isinstance(row.get("required_documents"), str):
            row["required_documents"] = json.loads(row["required_documents"])
        results.append(row)
    return results


async def get_scheme_by_id(db: AsyncSession, scheme_id: str) -> dict | None:
    r = await db.execute(text("""
        SELECT id::text, slug, name_en, name_hi, category, ministry, level,
               description_en, eligibility_criteria, benefit_description,
               benefit_value_annual, benefit_type, required_documents, application_url
        FROM schemes WHERE id=:id
    """), {"id": scheme_id})
    row = r.fetchone()
    if not row:
        return None
    data = dict(row._mapping)
    if isinstance(data.get("eligibility_criteria"), str):
        data["eligibility_criteria"] = json.loads(data["eligibility_criteria"])
    if isinstance(data.get("required_documents"), str):
        data["required_documents"] = json.loads(data["required_documents"])
    return data


async def save_eligibility_result(
    db: AsyncSession,
    citizen_id: str,
    scheme_id: str,
    is_eligible: bool,
    score: float,
    reasons: list,
    eligible_since=None,
    is_missed: bool = False,
    missed_months: int = 0,
    missed_value: int = 0,
):
    status = "eligible" if is_eligible else "ineligible"
    await db.execute(text("""
        INSERT INTO citizen_benefits (
            citizen_id, scheme_id, status, eligibility_score, eligibility_reasons,
            eligible_since, is_missed, missed_months, missed_value_est
        ) VALUES (
            :cid, :sid, :status, :score, CAST(:reasons AS jsonb),
            :es, :missed, :mm, :mv
        )
        ON CONFLICT (citizen_id, scheme_id) DO UPDATE SET
            status = EXCLUDED.status,
            eligibility_score = EXCLUDED.eligibility_score,
            eligibility_reasons = EXCLUDED.eligibility_reasons,
            is_missed = EXCLUDED.is_missed,
            missed_months = EXCLUDED.missed_months,
            missed_value_est = EXCLUDED.missed_value_est
    """), {
        "cid": citizen_id, "sid": scheme_id, "status": status,
        "score": score, "reasons": json.dumps(reasons),
        "es": eligible_since, "missed": is_missed,
        "mm": missed_months, "mv": missed_value
    })
    await db.commit()


async def log_agent_execution(
    db: AsyncSession,
    citizen_id: str,
    agent_name: str,
    triggered_by: str,
    status: str,
    input_summary: str,
    output_summary: str,
    reasoning_log: str,
    tool_calls: list,
    duration_ms: int,
) -> str:
    r = await db.execute(text("""
        INSERT INTO agent_executions (
            citizen_id, agent_name, triggered_by, status,
            input_summary, output_summary, reasoning_log, tool_calls, duration_ms, completed_at
        ) VALUES (
            :cid, :agent, :triggered, :status,
            :inp, :out, :reasoning, CAST(:tools AS jsonb), :dur, NOW()
        ) RETURNING id::text
    """), {
        "cid": citizen_id, "agent": agent_name, "triggered": triggered_by,
        "status": status, "inp": input_summary, "out": output_summary,
        "reasoning": reasoning_log, "tools": json.dumps(tool_calls), "dur": duration_ms
    })
    await db.commit()
    return r.scalar()
