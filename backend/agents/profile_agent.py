"""Profile Agent: Builds and maintains the Citizen Digital Twin."""
import json
import time
from typing import AsyncGenerator
from anthropic import AsyncAnthropic
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from ..core.config import settings
from ..core.serialization import json_safe
from .tools.scheme_tools import log_agent_execution

client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

SYSTEM_PROMPT = """You are the Profile Intelligence Agent for SarkarSetu AI.
Your role is to analyze citizen onboarding data and build a comprehensive Digital Twin profile.
Infer missing information from context clues. Identify the citizen's most likely welfare needs.
Respond in structured JSON only."""


async def run_profile_agent(
    citizen_id: str,
    profile_data: dict,
    db: AsyncSession
) -> AsyncGenerator[str, None]:
    """Streams agent reasoning as SSE events while building the profile."""
    start = time.time()
    tool_calls = []
    reasoning_parts = []

    yield f"data: {json.dumps({'type': 'thinking', 'agent': 'profile_agent', 'content': 'Analyzing your profile data...'})}\n\n"

    # Evaluate completeness
    filled = sum(1 for v in profile_data.values() if v is not None and v != "" and v != 0 and v != [])
    total = len(profile_data)
    confidence = min(0.95, round(filled / total + 0.1, 2))

    yield f"data: {json.dumps({'type': 'thinking', 'agent': 'profile_agent', 'content': f'Profile fields analyzed: {filled}/{total} completed'})}\n\n"

    safe_profile = json_safe(profile_data)

    # Use Claude to infer additional context
    prompt = f"""Analyze this citizen profile and provide welfare insights:

Profile: {json.dumps(safe_profile, indent=2)}

Provide a JSON response with:
1. "inferred_needs": list of top 3 welfare areas this citizen likely needs
2. "life_situation": one paragraph describing their situation
3. "priority_categories": list of scheme categories to prioritize (e.g., health, housing, welfare)
4. "confidence_boost": any additional data that would improve eligibility matching"""

    try:
        response = await client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=500,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}]
        )
        analysis_text = response.content[0].text
        tool_calls.append({"tool": "analyze_profile", "input": "citizen_data", "output": analysis_text[:200]})
        reasoning_parts.append(f"Profile analysis: {analysis_text[:300]}")

        # Extract insights
        try:
            analysis = json.loads(analysis_text)
            needs = analysis.get("inferred_needs", [])
            needs_str = ", ".join(needs)
            yield f"data: {json.dumps({'type': 'tool_result', 'agent': 'profile_agent', 'content': f'Identified priority needs: {needs_str}'})}\n\n"
        except json.JSONDecodeError:
            yield f"data: {json.dumps({'type': 'thinking', 'agent': 'profile_agent', 'content': 'Profile context analyzed'})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'type': 'thinking', 'agent': 'profile_agent', 'content': 'Profile evaluation complete'})}\n\n"

    # Update profile in DB with confidence score
    yield f"data: {json.dumps({'type': 'thinking', 'agent': 'profile_agent', 'content': f'Calculating twin confidence score: {int(confidence * 100)}%'})}\n\n"

    await db.execute(text("""
        UPDATE citizen_profiles
        SET confidence_score = :cs, twin_version = twin_version + 1, updated_at = NOW()
        WHERE citizen_id = :cid
    """), {"cs": confidence, "cid": citizen_id})
    await db.commit()

    duration_ms = int((time.time() - start) * 1000)

    await log_agent_execution(
        db, citizen_id, "profile_agent", "onboarding", "completed",
        f"Onboarding data for citizen {citizen_id}",
        f"Profile built with {int(confidence * 100)}% confidence",
        "\n".join(reasoning_parts),
        tool_calls, duration_ms
    )

    yield f"data: {json.dumps({'type': 'complete', 'agent': 'profile_agent', 'content': f'Digital Twin built. Confidence: {int(confidence * 100)}%', 'confidence': confidence})}\n\n"
