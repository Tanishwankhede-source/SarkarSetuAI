"""Discovery Agent: Matches citizen profile against all active schemes."""
import json
import time
from typing import AsyncGenerator
from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from ..services.eligibility_service import evaluate_eligibility, calculate_missed_value
from .tools.scheme_tools import get_all_active_schemes, save_eligibility_result, log_agent_execution


async def run_discovery_agent(
    citizen_id: str,
    db: AsyncSession,
    trigger: str = "user_action"
) -> AsyncGenerator[str, None]:
    """Streams discovery progress while evaluating all schemes."""
    start = time.time()
    tool_calls = []
    reasoning_parts = []

    yield f"data: {json.dumps({'type': 'thinking', 'agent': 'discovery_agent', 'content': 'Loading citizen profile...'})}\n\n"

    # Load citizen profile
    r = await db.execute(text("""
        SELECT p.*, c.phone FROM citizen_profiles p
        JOIN citizens c ON c.id = p.citizen_id
        WHERE p.citizen_id = :cid
    """), {"cid": citizen_id})
    row = r.fetchone()
    if not row:
        yield f"data: {json.dumps({'type': 'error', 'content': 'Profile not found'})}\n\n"
        return

    profile = dict(row._mapping)
    citizen_name = profile.get("full_name", "citizen")
    yield f"data: {json.dumps({'type': 'thinking', 'agent': 'discovery_agent', 'content': f'Profile loaded for {citizen_name}. Fetching schemes...'})}\n\n"

    # Load all schemes
    schemes = await get_all_active_schemes(db)
    yield f"data: {json.dumps({'type': 'thinking', 'agent': 'discovery_agent', 'content': f'Evaluating eligibility across {len(schemes)} government schemes...'})}\n\n"

    eligible_count = 0
    missed_count = 0
    total_missed_value = 0

    # Get life events for missed benefits calculation
    events_r = await db.execute(text("""
        SELECT event_type, event_date FROM life_events
        WHERE citizen_id = :cid ORDER BY event_date ASC
    """), {"cid": citizen_id})
    life_events = [dict(r._mapping) for r in events_r.fetchall()]

    for scheme in schemes:
        criteria = scheme.get("eligibility_criteria", {})
        if isinstance(criteria, str):
            criteria = json.loads(criteria)

        is_eligible, score, reasons = evaluate_eligibility(profile, criteria)

        # Calculate eligible_since for missed benefits
        eligible_since = None
        is_missed = False
        missed_months = 0
        missed_value = 0

        if is_eligible:
            eligible_count += 1

            # Determine when citizen first became eligible
            eligible_since = determine_eligible_since(profile, scheme, life_events)

            if eligible_since:
                months_ago = (date.today() - eligible_since).days // 30
                if months_ago > 2:  # If eligible for more than 2 months and not applied
                    # Check if already applied
                    app_r = await db.execute(text("""
                        SELECT status FROM citizen_benefits
                        WHERE citizen_id=:cid AND scheme_id=:sid
                    """), {"cid": citizen_id, "sid": scheme["id"]})
                    existing = app_r.fetchone()
                    if not existing or existing.status in ("discovered", "eligible"):
                        is_missed = True
                        missed_months, missed_value = calculate_missed_value(
                            scheme.get("benefit_value_annual", 0) or 0,
                            eligible_since
                        )
                        if missed_value > 0:
                            missed_count += 1
                            total_missed_value += missed_value

            tool_calls.append({
                "tool": "evaluate_eligibility",
                "scheme": scheme["name_en"],
                "result": f"eligible={is_eligible}, score={score}"
            })
            reasoning_parts.append(f"{scheme['name_en']}: ELIGIBLE (score={score})")

            scheme_name = scheme["name_en"]
            yield f"data: {json.dumps({'type': 'tool_call', 'agent': 'discovery_agent', 'content': f'✓ {scheme_name} — You qualify', 'scheme': scheme_name, 'eligible': True})}\n\n"
        else:
            reasoning_parts.append(f"{scheme['name_en']}: NOT eligible")

        await save_eligibility_result(
            db, citizen_id, scheme["id"],
            is_eligible, score, reasons,
            eligible_since, is_missed, missed_months, missed_value
        )

    duration_ms = int((time.time() - start) * 1000)

    output_summary = f"Found {eligible_count} eligible schemes, {missed_count} missed benefits worth ₹{total_missed_value:,}"
    await log_agent_execution(
        db, citizen_id, "discovery_agent", trigger, "completed",
        f"Scanned {len(schemes)} schemes for citizen {citizen_id}",
        output_summary,
        "\n".join(reasoning_parts[:20]),
        tool_calls[:10], duration_ms
    )

    yield f"data: {json.dumps({'type': 'complete', 'agent': 'discovery_agent', 'content': output_summary, 'eligible_count': eligible_count, 'missed_count': missed_count, 'missed_value': total_missed_value})}\n\n"


def determine_eligible_since(profile: dict, scheme: dict, life_events: list):
    """Determine when a citizen first became eligible for a scheme."""
    today = date.today()
    slug = scheme.get("slug", "")

    # Scheme-specific eligibility triggers
    if "widow" in slug or "widow" in scheme.get("name_en", "").lower():
        for ev in life_events:
            if ev["event_type"] == "spouse_death":
                return ev["event_date"] if isinstance(ev["event_date"], date) else date.fromisoformat(str(ev["event_date"]))

    if "kisan" in slug:
        return date(today.year - 1, 1, 1)  # Assume eligible since last year for farmers

    if "scholarship" in slug or "scholarship" in scheme.get("name_en", "").lower():
        if profile.get("currently_studying"):
            return date(today.year - 1, 7, 1)  # Academic year start

    # Default: eligible since scheme launched or 1 year ago
    launch = scheme.get("launched_date")
    if launch:
        if isinstance(launch, str):
            launch = date.fromisoformat(launch)
        return max(launch, date(today.year - 1, today.month, 1))

    return date(today.year - 1, today.month, 1)
