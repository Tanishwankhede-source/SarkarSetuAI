from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid


class OnboardingStep1(BaseModel):
    full_name: str
    age: int
    gender: str  # male|female|other
    state: str
    district: str


class OnboardingStep2(BaseModel):
    annual_income: int
    bpl_card: bool = False
    ration_card_type: Optional[str] = None
    occupation: str
    employment_status: str
    house_type: Optional[str] = None
    has_bank_account: bool = False
    has_jan_dhan: bool = False
    caste_category: str = "general"
    disability_status: bool = False
    disability_percent: int = 0
    family_size: int = 1
    marital_status: str = "single"
    num_children: int = 0
    children_ages: Optional[List[int]] = []
    education_level: str = "secondary"
    currently_studying: bool = False
    land_area_acres: float = 0.0


class OnboardingData(BaseModel):
    step1: OnboardingStep1
    step2: OnboardingStep2


class CitizenProfileOut(BaseModel):
    id: str
    citizen_id: str
    full_name: Optional[str]
    age: Optional[int]
    gender: Optional[str]
    state: Optional[str]
    district: Optional[str]
    annual_income: Optional[int]
    bpl_card: Optional[bool]
    occupation: Optional[str]
    employment_status: Optional[str]
    caste_category: Optional[str]
    disability_status: Optional[bool]
    family_size: Optional[int]
    marital_status: Optional[str]
    education_level: Optional[str]
    confidence_score: Optional[float]
    twin_version: Optional[int]
    updated_at: Optional[datetime]


class CitizenSummary(BaseModel):
    citizen_id: str
    full_name: str
    eligible_count: int
    missed_count: int
    missed_value: int
    applied_count: int
    approved_count: int
    confidence_score: float


class LifeEventCreate(BaseModel):
    event_type: str
    event_date: str  # ISO date string
    details: Optional[dict] = {}
