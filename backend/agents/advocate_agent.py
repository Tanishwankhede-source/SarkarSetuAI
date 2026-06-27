"""Citizen Advocate Agent: Turns rejections into actionable next steps."""
import json
import time
from typing import AsyncGenerator
from anthropic import AsyncAnthropic
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from ..core.config import settings
from .tools.scheme_tools import log_agent_execution

client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

ADVOCATE_SYSTEM = """You are the Citizen Advocate Agent for SarkarSetu AI.
Your job is to help citizens whose government scheme applications were rejected.
You are empathetic, clear, and action-oriented. You explain rejections in plain language.
You generate formal but warm appeal letters. You find alternative schemes when needed.
Always respond in valid JSON only."""


async def run_advocate_agent(
    citizen_id: str,
    application_id: str,
    rejection_reason: str,
    db: AsyncSession
) -> AsyncGenerator[str, None]:
    start = time.time()
    tool_calls = []

    yield f"data: {json.dumps({'type': 'thinking', 'agent': 'advocate_agent', 'content': 'Reviewing your application rejection...'})}\n\n"

    # Load application details
    r = await db.execute(text("""
        SELECT cb.*, s.name_en, s.name_hi, s.benefit_description, s.application_url,
               s.required_documents, cp.full_name, cp.state
        FROM citizen_benefits cb
        JOIN schemes s ON s.id = cb.scheme_id
        JOIN citizen_profiles cp ON cp.citizen_id = cb.citizen_id
        WHERE cb.id = :aid AND cb.citizen_id = :cid
    """), {"aid": application_id, "cid": citizen_id})
    row = r.fetchone()

    if not row:
        yield f"data: {json.dumps({'type': 'error', 'content': 'Application not found'})}\n\n"
        return

    app = dict(row._mapping)
    reason = rejection_reason or app.get("rejection_reason") or "No reason provided"

    reason_preview = reason[:100]
    advocate_msg = json.dumps({'type': 'thinking', 'agent': 'advocate_agent', 'content': f'Analyzing rejection: "{reason_preview}"'})
    yield f"data: {advocate_msg}\n\n"

    # Use Claude to analyze and generate advocacy
    prompt = f"""A citizen's application for "{app['name_en']}" was rejected.

Rejection reason: {reason}
Citizen name: {app.get('full_name', 'Citizen')}
State: {app.get('state', 'India')}
Required documents: {app.get('required_documents', [])}

Provide a JSON response with:
1. "plain_explanation": Explain the rejection in 1-2 sentences of simple language a non-expert would understand
2. "action_steps": List of 2-4 specific steps to fix the issue (each step is a string)
3. "appeal_letter": A formal but warm 150-word appeal letter on behalf of the citizen
4. "can_appeal": boolean - whether an appeal is viable
5. "alternative_message": One sentence suggesting the citizen explore alternatives if appeal isn't viable"""

    advocate_result = {}
    try:
        yield f"data: {json.dumps({'type': 'thinking', 'agent': 'advocate_agent', 'content': 'Preparing your advocacy strategy...'})}\n\n"

        response = await client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=800,
            system=ADVOCATE_SYSTEM,
            messages=[{"role": "user", "content": prompt}]
        )
        text_content = response.content[0].text
        tool_calls.append({"tool": "analyze_rejection", "input": reason[:100], "output": text_content[:200]})

        try:
            advocate_result = json.loads(text_content)
        except json.JSONDecodeError:
            advocate_result = {
                "plain_explanation": f"Your application was rejected because: {reason}",
                "action_steps": ["Gather required documents", "Resubmit application", "Contact local welfare office"],
                "appeal_letter": f"Dear Sir/Madam,\n\nI am writing to appeal the rejection of my application for {app['name_en']}. The rejection reason was: {reason}. I believe I meet all eligibility criteria and respectfully request a review of my application.\n\nYours sincerely,\n{app.get('full_name', 'Applicant')}",
                "can_appeal": True,
                "alternative_message": "You may also explore other eligible schemes in your dashboard."
            }
    except Exception as e:
        advocate_result = {
            "plain_explanation": f"Application rejected due to: {reason}",
            "action_steps": ["Review required documents", "Contact welfare office", "Resubmit with corrections"],
            "appeal_letter": f"I appeal the rejection of my {app['name_en']} application. Reason given: {reason}.",
            "can_appeal": True,
            "alternative_message": "Check other eligible schemes in your dashboard."
        }

    yield f"data: {json.dumps({'type': 'tool_result', 'agent': 'advocate_agent', 'content': advocate_result.get('plain_explanation', '')})}\n\n"

    for step in advocate_result.get("action_steps", []):
        yield f"data: {json.dumps({'type': 'thinking', 'agent': 'advocate_agent', 'content': f'Action: {step}'})}\n\n"

    # Update application with appeal flag
    await db.execute(text("""
        UPDATE citizen_benefits SET appeal_generated=true WHERE id=:aid
    """), {"aid": application_id})
    await db.commit()

    duration_ms = int((time.time() - start) * 1000)
    await log_agent_execution(
        db, citizen_id, "advocate_agent", "rejection", "completed",
        f"Application {application_id} rejected: {reason[:100]}",
        f"Appeal generated. Steps: {len(advocate_result.get('action_steps', []))}",
        advocate_result.get("plain_explanation", ""),
        tool_calls, duration_ms
    )

    yield f"data: {json.dumps({'type': 'complete', 'agent': 'advocate_agent', 'content': 'Advocacy ready', 'result': advocate_result})}\n\n"
