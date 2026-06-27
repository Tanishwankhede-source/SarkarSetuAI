from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel, Field
from typing import Optional
from ..core.database import get_db
from ..core.auth import get_current_citizen
import json
import uuid

router = APIRouter(prefix="/benefits", tags=["benefits"])


def _row_to_benefit(row) -> dict:
    d = dict(row._mapping)
    d["id"] = str(d["id"])
    d["scheme_id"] = str(d["scheme_id"])
    if isinstance(d.get("eligibility_reasons"), str):
        d["eligibility_reasons"] = json.loads(d["eligibility_reasons"])
    if isinstance(d.get("required_documents"), str):
        d["required_documents"] = json.loads(d["required_documents"])
    if isinstance(d.get("eligibility_criteria"), str):
        d["eligibility_criteria"] = json.loads(d["eligibility_criteria"])
    if isinstance(d.get("application_data"), str):
        d["application_data"] = json.loads(d["application_data"])
    if isinstance(d.get("documents_submitted"), str):
        d["documents_submitted"] = json.loads(d["documents_submitted"])
    if d.get("eligible_since"):
        d["eligible_since"] = str(d["eligible_since"])
    if d.get("discovered_at"):
        d["discovered_at"] = d["discovered_at"].isoformat()
    if d.get("applied_at"):
        d["applied_at"] = d["applied_at"].isoformat()
    return d


BASE_QUERY = """
    SELECT cb.id, cb.scheme_id, s.slug as scheme_slug, s.name_en as scheme_name,
           s.name_hi as scheme_name_hi, s.category as scheme_category,
           s.ministry as scheme_ministry, s.benefit_value_annual, s.benefit_type,
           cb.status, cb.eligibility_score, cb.eligibility_reasons,
           cb.is_missed, cb.missed_months, cb.missed_value_est, cb.eligible_since,
           cb.discovered_at, cb.applied_at, cb.application_ref, cb.rejection_reason,
           cb.application_data, cb.documents_submitted,
           s.description_en, s.benefit_description, s.eligibility_criteria,
           s.required_documents, s.application_url
    FROM citizen_benefits cb
    JOIN schemes s ON s.id = cb.scheme_id
    WHERE cb.citizen_id = :cid
"""


class DocumentSubmission(BaseModel):
    slug: str
    file_name: str
    confirmed: bool = False


class ApplicationSubmit(BaseModel):
    full_name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=10)
    address: str = Field(..., min_length=5)
    district: str = Field(..., min_length=2)
    state: str = Field(..., min_length=2)
    bank_account: Optional[str] = None
    bank_ifsc: Optional[str] = None
    additional_notes: Optional[str] = None
    documents: list[DocumentSubmission] = Field(..., min_length=1)
    declaration_accepted: bool = False


@router.get("/eligible")
async def get_eligible(
    category: str = None,
    citizen: dict = Depends(get_current_citizen),
    db: AsyncSession = Depends(get_db)
):
    where = "AND cb.status IN ('eligible','discovered','applied','approved','pending')"
    params = {"cid": citizen["id"]}
    if category:
        where += " AND s.category = :cat"
        params["cat"] = category

    rows = await db.execute(text(f"{BASE_QUERY} {where} ORDER BY s.benefit_value_annual DESC NULLS LAST"), params)
    return [_row_to_benefit(r) for r in rows.fetchall()]


@router.get("/missed")
async def get_missed(citizen: dict = Depends(get_current_citizen), db: AsyncSession = Depends(get_db)):
    rows = await db.execute(text(f"""
        {BASE_QUERY} AND cb.is_missed=true
        ORDER BY cb.missed_value_est DESC NULLS LAST
    """), {"cid": citizen["id"]})
    return [_row_to_benefit(r) for r in rows.fetchall()]


@router.get("/categories")
async def get_categories(citizen: dict = Depends(get_current_citizen), db: AsyncSession = Depends(get_db)):
    rows = await db.execute(text("""
        SELECT s.category, COUNT(*) as count
        FROM citizen_benefits cb JOIN schemes s ON s.id=cb.scheme_id
        WHERE cb.citizen_id=:cid AND cb.status IN ('eligible','discovered')
        GROUP BY s.category ORDER BY count DESC
    """), {"cid": citizen["id"]})
    return [dict(r._mapping) for r in rows.fetchall()]


@router.get("/{benefit_id}")
async def get_benefit_detail(
    benefit_id: str,
    citizen: dict = Depends(get_current_citizen),
    db: AsyncSession = Depends(get_db)
):
    r = await db.execute(text(f"""
        {BASE_QUERY} AND cb.id=:bid
    """), {"cid": citizen["id"], "bid": benefit_id})
    row = r.fetchone()
    if not row:
        raise HTTPException(404, "Benefit not found")
    return _row_to_benefit(row)


@router.post("/{scheme_id}/apply")
async def apply_for_benefit(
    scheme_id: str,
    payload: ApplicationSubmit,
    citizen: dict = Depends(get_current_citizen),
    db: AsyncSession = Depends(get_db)
):
    if not payload.declaration_accepted:
        raise HTTPException(400, "You must accept the declaration before submitting")

    # Load scheme and verify citizen has this benefit
    r = await db.execute(text("""
        SELECT s.required_documents, cb.status
        FROM schemes s
        LEFT JOIN citizen_benefits cb ON cb.scheme_id = s.id AND cb.citizen_id = :cid
        WHERE s.id = :sid
    """), {"cid": citizen["id"], "sid": scheme_id})
    row = r.fetchone()
    if not row:
        raise HTTPException(404, "Scheme not found")

    required = row._mapping["required_documents"]
    if isinstance(required, str):
        required = json.loads(required)
    required = required or []

    if row._mapping["status"] in ("applied", "approved", "pending"):
        raise HTTPException(400, "Application already submitted for this scheme")

    submitted_slugs = {d.slug for d in payload.documents if d.confirmed and d.file_name.strip()}
    missing = [doc for doc in required if doc not in submitted_slugs]
    if missing:
        raise HTTPException(400, f"Missing required documents: {', '.join(missing)}")

    for doc in payload.documents:
        if doc.slug in required and (not doc.file_name.strip() or not doc.confirmed):
            raise HTTPException(400, f"Document '{doc.slug}' must be uploaded and confirmed")

    ref = f"SS-{uuid.uuid4().hex[:8].upper()}"
    app_data = {
        "full_name": payload.full_name,
        "phone": payload.phone,
        "address": payload.address,
        "district": payload.district,
        "state": payload.state,
        "bank_account": payload.bank_account,
        "bank_ifsc": payload.bank_ifsc,
        "additional_notes": payload.additional_notes,
    }
    docs_data = [d.model_dump() for d in payload.documents if d.confirmed]

    await db.execute(text("""
        INSERT INTO citizen_benefits (
            citizen_id, scheme_id, status, application_ref, applied_at,
            application_data, documents_submitted
        )
        VALUES (:cid, :sid, 'applied', :ref, NOW(), :appdata::jsonb, :docs::jsonb)
        ON CONFLICT (citizen_id, scheme_id) DO UPDATE SET
            status='applied', application_ref=:ref, applied_at=NOW(),
            application_data=:appdata::jsonb, documents_submitted=:docs::jsonb
    """), {
        "cid": citizen["id"], "sid": scheme_id, "ref": ref,
        "appdata": json.dumps(app_data), "docs": json.dumps(docs_data),
    })
    await db.commit()
    return {"success": True, "application_ref": ref, "status": "applied"}


@router.get("/applications/list")
async def get_applications(citizen: dict = Depends(get_current_citizen), db: AsyncSession = Depends(get_db)):
    rows = await db.execute(text(f"""
        {BASE_QUERY} AND cb.status IN ('applied','pending','approved','rejected')
        ORDER BY cb.applied_at DESC NULLS LAST
    """), {"cid": citizen["id"]})
    return [_row_to_benefit(r) for r in rows.fetchall()]
