from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class SchemeOut(BaseModel):
    id: str
    slug: str
    name_en: str
    name_hi: Optional[str]
    category: str
    ministry: Optional[str]
    level: str
    description_en: Optional[str]
    benefit_description: Optional[str]
    benefit_value_annual: Optional[int]
    benefit_type: Optional[str]
    required_documents: Optional[List[str]]
    application_url: Optional[str]


class BenefitOut(BaseModel):
    id: str
    scheme_id: str
    scheme_name: str
    scheme_category: str
    scheme_ministry: Optional[str]
    benefit_value_annual: Optional[int]
    benefit_type: Optional[str]
    status: str
    eligibility_score: Optional[float]
    eligibility_reasons: Optional[List[str]]
    is_missed: bool
    missed_months: Optional[int]
    missed_value_est: Optional[int]
    eligible_since: Optional[str]
    discovered_at: Optional[datetime]
    applied_at: Optional[datetime]
    application_ref: Optional[str]
    rejection_reason: Optional[str]
    description_en: Optional[str]
    required_documents: Optional[List[str]]
    application_url: Optional[str]


class ApplicationCreate(BaseModel):
    scheme_id: str


class AdvocateRequest(BaseModel):
    application_id: str
    rejection_reason: Optional[str] = ""


class WelfareGap(BaseModel):
    state: str
    district: Optional[str]
    scheme_name: str
    scheme_category: str
    total_eligible: int
    total_enrolled: int
    enrollment_rate: float
    coverage_gap: int
    primary_barrier: Optional[str]
    estimated_gap_value: int
    gap_severity: str


class GovernmentOverview(BaseModel):
    total_citizens: int
    total_schemes: int
    total_eligible_matches: int
    total_missed_value: int
    avg_enrollment_rate: float
    critical_gaps: int
