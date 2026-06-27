from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from ..core.database import get_db
from ..core.auth import get_current_citizen
from ..models.citizen import OnboardingData, CitizenProfileOut, CitizenSummary, LifeEventCreate
import json

router = APIRouter(prefix="/citizen", tags=["citizen"])


@router.post("/onboard")
async def onboard_citizen(
    data: OnboardingData,
    citizen: dict = Depends(get_current_citizen),
    db: AsyncSession = Depends(get_db)
):
    cid = citizen["id"]
    s1, s2 = data.step1, data.step2

    # Upsert profile
    await db.execute(text("""
        INSERT INTO citizen_profiles (
            citizen_id, full_name, age, gender, state, district,
            annual_income, bpl_card, ration_card_type, occupation, employment_status,
            house_type, has_bank_account, has_jan_dhan, caste_category,
            disability_status, disability_percent, family_size, marital_status,
            num_children, children_ages, education_level, currently_studying,
            land_area_acres, confidence_score
        ) VALUES (
            :cid,:name,:age,:gender,:state,:district,
            :income,:bpl,:ration,:occ,:emp,
            :house,:bank,:jandhan,:caste,
            :disab,:disab_pct,:fam,:marital,
            :children,:children_ages,:edu,:studying,
            :land,:conf
        )
        ON CONFLICT (citizen_id) DO UPDATE SET
            full_name=EXCLUDED.full_name, age=EXCLUDED.age, gender=EXCLUDED.gender,
            state=EXCLUDED.state, district=EXCLUDED.district,
            annual_income=EXCLUDED.annual_income, bpl_card=EXCLUDED.bpl_card,
            occupation=EXCLUDED.occupation, employment_status=EXCLUDED.employment_status,
            caste_category=EXCLUDED.caste_category, disability_status=EXCLUDED.disability_status,
            family_size=EXCLUDED.family_size, marital_status=EXCLUDED.marital_status,
            education_level=EXCLUDED.education_level, currently_studying=EXCLUDED.currently_studying,
            land_area_acres=EXCLUDED.land_area_acres, updated_at=NOW()
    """), {
        "cid": cid, "name": s1.full_name, "age": s1.age, "gender": s1.gender,
        "state": s1.state.lower(), "district": s1.district.lower(),
        "income": s2.annual_income, "bpl": s2.bpl_card, "ration": s2.ration_card_type,
        "occ": s2.occupation, "emp": s2.employment_status,
        "house": s2.house_type, "bank": s2.has_bank_account, "jandhan": s2.has_jan_dhan,
        "caste": s2.caste_category, "disab": s2.disability_status,
        "disab_pct": s2.disability_percent, "fam": s2.family_size,
        "marital": s2.marital_status, "children": s2.num_children,
        "children_ages": s2.children_ages or [],
        "edu": s2.education_level, "studying": s2.currently_studying,
        "land": s2.land_area_acres, "conf": 0.75
    })
    await db.commit()
    return {"success": True, "citizen_id": cid}


@router.get("/twin")
async def get_twin(citizen: dict = Depends(get_current_citizen), db: AsyncSession = Depends(get_db)):
    r = await db.execute(text("""
        SELECT p.*, c.phone FROM citizen_profiles p
        JOIN citizens c ON c.id = p.citizen_id
        WHERE p.citizen_id = :cid
    """), {"cid": citizen["id"]})
    row = r.fetchone()
    if not row:
        raise HTTPException(404, "Profile not found")
    data = dict(row._mapping)
    # Serialize arrays and convert UUID
    data["id"] = str(data["id"])
    data["citizen_id"] = str(data["citizen_id"])
    if data.get("children_ages"):
        data["children_ages"] = list(data["children_ages"])
    return data


@router.get("/summary")
async def get_summary(citizen: dict = Depends(get_current_citizen), db: AsyncSession = Depends(get_db)):
    cid = citizen["id"]

    r = await db.execute(text("""
        SELECT p.full_name, p.confidence_score FROM citizen_profiles p WHERE p.citizen_id=:cid
    """), {"cid": cid})
    profile = r.fetchone()
    if not profile:
        raise HTTPException(404, "Profile not found")

    counts = await db.execute(text("""
        SELECT
            COUNT(CASE WHEN status IN ('eligible','discovered') THEN 1 END) as eligible,
            COUNT(CASE WHEN is_missed=true THEN 1 END) as missed,
            COALESCE(SUM(CASE WHEN is_missed=true THEN missed_value_est ELSE 0 END),0) as missed_val,
            COUNT(CASE WHEN status='applied' THEN 1 END) as applied,
            COUNT(CASE WHEN status='approved' THEN 1 END) as approved
        FROM citizen_benefits WHERE citizen_id=:cid
    """), {"cid": cid})
    c = counts.fetchone()

    return {
        "citizen_id": cid,
        "full_name": profile.full_name or "Citizen",
        "eligible_count": c.eligible or 0,
        "missed_count": c.missed or 0,
        "missed_value": int(c.missed_val or 0),
        "applied_count": c.applied or 0,
        "approved_count": c.approved or 0,
        "confidence_score": float(profile.confidence_score or 0.5),
    }


@router.post("/events")
async def add_life_event(
    event: LifeEventCreate,
    citizen: dict = Depends(get_current_citizen),
    db: AsyncSession = Depends(get_db)
):
    await db.execute(text("""
        INSERT INTO life_events (citizen_id, event_type, event_date, details, source)
        VALUES (:cid, :etype, :edate, :details::jsonb, 'citizen_reported')
    """), {
        "cid": citizen["id"], "etype": event.event_type,
        "edate": event.event_date, "details": json.dumps(event.details or {})
    })
    await db.commit()
    return {"success": True}
