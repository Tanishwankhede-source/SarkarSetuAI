"""Missed Benefits Agent: Analyzes historical eligibility to surface unclaimed benefits."""
import json
import time
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from anthropic import AsyncAnthropic
from ..core.config import settings
from .tools.scheme_tools import log_agent_execution

client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)


async def run_missed_benefits_agent(
    citizen_id: str,
    db: AsyncSession
) -> AsyncGenerator[str, None]:
    start = time.time()
    tool_calls = []

    yield f"data: {json.dumps({'type': 'thinking', 'agent': 'missed_benefits_agent', 'content': 'Scanning your benefit history...'})}\n\n"

    # Get all missed benefits
    rows = await db.execute(text("""
        SELECT cb.id::text, cb.missed_months, cb.missed_value_est, cb.eligible_since,
               s.name_en, s.category, s.benefit_value_annual
        FROM citizen_benefits cb
        JOIN schemes s ON s.id = cb.scheme_id
        WHERE cb.citizen_id = :cid AND cb.is_missed = true
        ORDER BY cb.missed_value_est DESC
    """), {"cid": citizen_id})
    missed = [dict(r._mapping) for r in rows.fetchall()]

    yield f"data: {json.dumps({'type': 'thinking', 'agent': 'missed_benefits_agent', 'content': f'Found {len(missed)} benefits you may have missed...'})}\n\n"

    total_missed = sum(m.get("missed_value_est") or 0 for m in missed)

    for m in missed:
        months = m.get("missed_months", 0)
        value = m.get("missed_value_est", 0) or 0
        scheme_name = m["name_en"]
        yield f"data: {json.dumps({'type': 'tool_result', 'agent': 'missed_benefits_agent', 'content': f'⚠ {scheme_name} — missed {months} months — est. ₹{value:,} unclaimed'})}\n\n"
        tool_calls.append({"tool": "calculate_missed_value", "scheme": scheme_name, "value": value})

    if missed and settings.ANTHROPIC_API_KEY:
        # Use Claude to provide empathetic summary
        try:
            response = await client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=200,
                messages=[{"role": "user", "content": f"""
                    A citizen has missed the following government benefits:
                    {json.dumps([{'scheme': m['name_en'], 'months': m['missed_months'], 'value': m['missed_value_est']} for m in missed[:3]])}
                    
                    Write a 2-sentence empathetic message explaining this situation and encouraging them to apply now.
                    Keep it warm, human, and action-oriented. No jargon.
                """}]
            )
            summary_msg = response.content[0].text
        except Exception:
            summary_msg = f"You have been eligible for {len(missed)} benefits that you haven't claimed yet. Apply now to start receiving your support."
    elif missed:
        summary_msg = f"You have been eligible for {len(missed)} benefits worth approximately ₹{total_missed:,} that you haven't claimed yet."
    else:
        summary_msg = "No missed benefits detected. You're up to date!"

    duration_ms = int((time.time() - start) * 1000)
    await log_agent_execution(
        db, citizen_id, "missed_benefits_agent", "discovery_complete", "completed",
        "Analyzing unclaimed benefits",
        f"Found {len(missed)} missed benefits totalling ₹{total_missed:,}",
        summary_msg, tool_calls, duration_ms
    )

    yield f"data: {json.dumps({'type': 'complete', 'agent': 'missed_benefits_agent', 'content': summary_msg, 'missed_count': len(missed), 'total_missed_value': total_missed})}\n\n"
