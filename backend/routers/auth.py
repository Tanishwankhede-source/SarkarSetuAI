from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel
from ..core.database import get_db
from ..core.auth import create_access_token
import random

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory OTP store (use Redis in production)
_otp_store: dict = {}


class OTPRequest(BaseModel):
    phone: str


class OTPVerify(BaseModel):
    phone: str
    otp: str


@router.post("/request-otp")
async def request_otp(req: OTPRequest):
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    _otp_store[req.phone] = otp
    # In production: send via SMS
    # For demo/dev: return in response
    return {"success": True, "message": "OTP sent", "dev_otp": otp}


@router.post("/verify-otp")
async def verify_otp(req: OTPVerify, db: AsyncSession = Depends(get_db)):
    stored_otp = _otp_store.get(req.phone)
    # Accept "123456" as universal demo OTP
    if req.otp != stored_otp and req.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP")

    _otp_store.pop(req.phone, None)

    # Upsert citizen
    r = await db.execute(text("SELECT id FROM citizens WHERE phone=:phone"), {"phone": req.phone})
    existing = r.fetchone()

    if existing:
        citizen_id = str(existing.id)
        is_new = False
        await db.execute(text("UPDATE citizens SET last_active=NOW() WHERE id=:id"), {"id": citizen_id})
    else:
        r2 = await db.execute(
            text("INSERT INTO citizens (phone, phone_verified) VALUES (:phone, true) RETURNING id"),
            {"phone": req.phone}
        )
        citizen_id = str(r2.scalar())
        is_new = True

    await db.commit()

    # Check if profile exists
    r3 = await db.execute(text("SELECT id FROM citizen_profiles WHERE citizen_id=:cid"), {"cid": citizen_id})
    has_profile = r3.fetchone() is not None

    token = create_access_token({"sub": citizen_id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "citizen_id": citizen_id,
        "is_new": is_new,
        "has_profile": has_profile
    }
