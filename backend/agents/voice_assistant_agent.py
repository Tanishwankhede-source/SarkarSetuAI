"""Voice Assistant Agent: Multilingual Q&A about schemes and citizen benefits."""
import json
import re
import time
from typing import AsyncGenerator
from anthropic import AsyncAnthropic
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from ..core.config import settings
from .tools.scheme_tools import log_agent_execution

client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

VOICE_SYSTEM = """You are SarkarSetu Voice Assistant — a friendly, patient government welfare guide for Indian citizens.
You help people who may not be tech-savvy understand government schemes, required documents, and application steps.

CRITICAL RULES:
1. ALWAYS respond in the SAME language the citizen used (Hindi, Marathi, Tamil, English, etc.)
2. Use simple, clear language — avoid jargon
3. Be warm, respectful, and encouraging
4. If asked about schemes, use the citizen's profile and eligible schemes data provided
5. Keep responses concise (2-4 short paragraphs max) — this will be read aloud
6. For document questions, list documents clearly with where to get them
7. Never tell citizens to skip document requirements
8. Respond in plain text only (no JSON, no markdown)"""


def _detect_language(text: str) -> str:
    if re.search(r"[\u0900-\u097F]", text):
        return "hi"
    if re.search(r"[\u0A80-\u0AFF]", text):
        return "gu"
    if re.search(r"[\u0B80-\u0BFF]", text):
        return "ta"
    if re.search(r"[\u0C00-\u0C7F]", text):
        return "te"
    if re.search(r"[\u0980-\u09FF]", text):
        return "bn"
    if re.search(r"[\u0A00-\u0A7F]", text):
        return "pa"
    return "en"


def _fallback_response(query: str, profile: dict, schemes: list, lang: str) -> str:
    name = profile.get("full_name", "Citizen")
    scheme_count = len(schemes)
    top_schemes = schemes[:3]

    if lang == "hi":
        if any(w in query.lower() for w in ["दस्तावेज", "document", "कागज", "पेपर"]):
            docs = set()
            for s in schemes:
                for d in (s.get("required_documents") or []):
                    docs.add(d.replace("_", " "))
            doc_list = ", ".join(list(docs)[:8]) if docs else "आधार, बैंक पासबुक, आय प्रमाण पत्र"
            return (
                f"नमस्ते {name}! आपकी योजनाओं के लिए आमतौर पर ये दस्तावेज़ चाहिए: {doc_list}. "
                f"हर योजना के लिए अलग दस्तावेज़ हो सकते हैं — योजना विवरण पृष्ठ पर पूरी सूची देखें। "
                f"दस्तावेज़ आपके जिले के तहसीलदार कार्यालय, सीएससी, या ई-डिस्ट्रिक्ट पोर्टल से मिल सकते हैं।"
            )
        if any(w in query.lower() for w in ["योजना", "scheme", "लाभ", "benefit", "कितन"]):
            if top_schemes:
                names = ", ".join(s["scheme_name"] for s in top_schemes)
                return (
                    f"नमस्ते {name}! आप {scheme_count} सरकारी योजनाओं के लिए पात्र हैं। "
                    f"शीर्ष योजनाएं: {names}. "
                    f"आवेदन के लिए 'योजनाएं' पृष्ठ पर जाएं, योजना चुनें, दस्तावेज़ तैयार करें, और फॉर्म भरें।"
                )
            return f"नमस्ते {name}! अभी कोई योजना मिली नहीं। कृपया पहले ऑनबोर्डिंग पूरा करें।"
        if any(w in query.lower() for w in ["आवेदन", "apply", "अप्लाई", "फॉर्म"]):
            return (
                f"नमस्ते {name}! आवेदन करने के लिए: 1) योजना चुनें 2) आवश्यक दस्तावेज़ तैयार करें "
                f"3) 'आवेदन शुरू करें' बटन दबाएं 4) अपनी जानकारी भरें 5) दस्तावेज़ अपलोड करें 6) घोषणा स्वीकार करके जमा करें।"
            )
        return (
            f"नमस्ते {name}! मैं सरकारSetu सहायक हूं। आप {scheme_count} योजनाओं के लिए पात्र हैं। "
            f"मुझसे योजनाओं, दस्तावेज़ों, या आवेदन प्रक्रिया के बारे में पूछें।"
        )

    # English fallback
    if any(w in query.lower() for w in ["document", "paper", "proof"]):
        docs = set()
        for s in schemes:
            for d in (s.get("required_documents") or []):
                docs.add(d.replace("_", " "))
        doc_list = ", ".join(list(docs)[:8]) if docs else "Aadhaar, bank passbook, income certificate"
        return (
            f"Hello {name}! Common documents needed: {doc_list}. "
            f"Each scheme has specific requirements — check the scheme detail page. "
            f"Get documents from your Tehsildar office, CSC, or e-District portal."
        )
    if top_schemes:
        names = ", ".join(s["scheme_name"] for s in top_schemes)
        return (
            f"Hello {name}! You are eligible for {scheme_count} government schemes. "
            f"Top matches: {names}. To apply, go to Schemes, select one, prepare documents, and fill the application form."
        )
    return (
        f"Hello {name}! I am your SarkarSetu assistant. Ask me about schemes, documents, or how to apply."
    )


async def run_voice_assistant(
    citizen_id: str,
    query: str,
    language_hint: str | None,
    db: AsyncSession,
) -> AsyncGenerator[str, None]:
    start = time.time()
    lang = language_hint or _detect_language(query)

    yield f"data: {json.dumps({'type': 'thinking', 'agent': 'voice_assistant', 'content': 'Listening to your question...'})}\n\n"

    # Load profile
    r = await db.execute(text("SELECT * FROM citizen_profiles WHERE citizen_id=:cid"), {"cid": citizen_id})
    profile_row = r.fetchone()
    profile = dict(profile_row._mapping) if profile_row else {}

    # Load eligible schemes
    r2 = await db.execute(text("""
        SELECT s.name_en as scheme_name, s.name_hi, s.category, s.benefit_description,
               s.required_documents, s.benefit_value_annual, cb.eligibility_score
        FROM citizen_benefits cb JOIN schemes s ON s.id = cb.scheme_id
        WHERE cb.citizen_id = :cid AND cb.status IN ('eligible','discovered','applied')
        ORDER BY cb.eligibility_score DESC LIMIT 10
    """), {"cid": citizen_id})
    schemes = []
    for row in r2.fetchall():
        d = dict(row._mapping)
        if isinstance(d.get("required_documents"), str):
            d["required_documents"] = json.loads(d["required_documents"])
        schemes.append(d)

    context = json.dumps({
        "profile": {
            "name": profile.get("full_name"),
            "age": profile.get("age"),
            "state": profile.get("state"),
            "district": profile.get("district"),
            "income": profile.get("annual_income"),
            "occupation": profile.get("occupation"),
        },
        "eligible_schemes": schemes,
        "detected_language": lang,
    }, default=str)

    response_text = ""
    try:
        yield f"data: {json.dumps({'type': 'thinking', 'agent': 'voice_assistant', 'content': 'Preparing answer in your language...'})}\n\n"

        api_response = await client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=600,
            system=VOICE_SYSTEM,
            messages=[{
                "role": "user",
                "content": f"Citizen data:\n{context}\n\nCitizen question: {query}\n\nRespond in the same language as the question.",
            }],
        )
        response_text = api_response.content[0].text.strip()
    except Exception:
        response_text = _fallback_response(query, profile, schemes, lang)

    yield f"data: {json.dumps({'type': 'complete', 'agent': 'voice_assistant', 'content': response_text, 'language': lang, 'result': {'answer': response_text, 'language': lang}})}\n\n"

    duration = int((time.time() - start) * 1000)
    await log_agent_execution(
        db, citizen_id, "voice_assistant", "voice_query",
        "completed", query[:200], response_text[:300], response_text,
        [], duration,
    )
