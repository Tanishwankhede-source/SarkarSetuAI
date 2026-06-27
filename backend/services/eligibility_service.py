"""Evaluate eligibility using structured JSON criteria against citizen profile."""
from typing import Tuple, List
from datetime import date


def evaluate_eligibility(citizen: dict, scheme_criteria: dict) -> Tuple[bool, float, List[str]]:
    """
    Returns: (is_eligible, confidence_score, matched_reasons)
    """
    checks: List[bool] = []
    reasons: List[str] = []
    fail_reasons: List[str] = []

    age = citizen.get("age", 0)
    income = citizen.get("annual_income", 0)
    gender = citizen.get("gender", "")
    caste = citizen.get("caste_category", "general")
    occupation = citizen.get("occupation", "")
    marital = citizen.get("marital_status", "")
    state = (citizen.get("state") or "").lower()
    bpl = citizen.get("bpl_card", False)
    disability = citizen.get("disability_status", False)
    studying = citizen.get("currently_studying", False)
    house_type = citizen.get("house_type", "")
    land_acres = citizen.get("land_area_acres", 0) or 0
    has_bank = citizen.get("has_bank_account", False)
    education = citizen.get("education_level", "")
    disability_pct = citizen.get("disability_percent", 0) or 0

    c = scheme_criteria

    # Age checks
    min_age = c.get("min_age")
    max_age = c.get("max_age")
    if min_age is not None and age < min_age:
        checks.append(False)
        fail_reasons.append(f"Minimum age {min_age} years required (you are {age})")
    elif max_age is not None and age > max_age:
        checks.append(False)
        fail_reasons.append(f"Maximum age {max_age} years (you are {age})")
    else:
        checks.append(True)
        if min_age:
            reasons.append(f"Age {age} meets requirement ✓")

    # Income check
    max_income = c.get("max_annual_income")
    if max_income is not None and income > max_income:
        checks.append(False)
        fail_reasons.append(f"Annual income ₹{income:,} exceeds limit of ₹{max_income:,}")
    else:
        checks.append(True)
        if max_income:
            reasons.append(f"Income ₹{income:,} within limit ✓")

    # Gender check
    genders = c.get("gender", ["male", "female", "other"])
    if gender and gender not in genders:
        checks.append(False)
        fail_reasons.append(f"Scheme available for {', '.join(genders)} only")
    else:
        checks.append(True)

    # Caste check
    caste_cats = c.get("caste_categories", ["all"])
    if "all" not in caste_cats and caste not in caste_cats:
        checks.append(False)
        fail_reasons.append(f"Scheme for {', '.join(caste_cats)} category only")
    else:
        checks.append(True)
        if "all" not in caste_cats:
            reasons.append(f"{caste.upper()} category eligible ✓")

    # State check
    states = c.get("states", ["all"])
    if states and "all" not in states:
        if state not in [s.lower() for s in states]:
            checks.append(False)
            fail_reasons.append(f"Scheme available only in {', '.join(states)}")
        else:
            checks.append(True)

    # BPL check
    if c.get("bpl_required") and not bpl:
        checks.append(False)
        fail_reasons.append("BPL card required")
    elif c.get("bpl_required") and bpl:
        checks.append(True)
        reasons.append("BPL card holder ✓")

    # Occupation check
    occ_required = c.get("occupation", ["all"])
    if "all" not in occ_required and occupation not in occ_required:
        checks.append(False)
        fail_reasons.append(f"Scheme for {', '.join(occ_required)} only")
    else:
        checks.append(True)

    # Marital status check
    marital_req = c.get("marital_status", [])
    if marital_req and marital not in marital_req:
        checks.append(False)
        fail_reasons.append(f"Applicant must be {', '.join(marital_req)}")
    elif marital_req and marital in marital_req:
        checks.append(True)
        reasons.append(f"Marital status ({marital}) qualifies ✓")

    # Bank account check
    if c.get("requires_bank_account") and not has_bank:
        checks.append(False)
        fail_reasons.append("Bank account required")
    elif c.get("requires_bank_account") and has_bank:
        checks.append(True)
        reasons.append("Bank account available ✓")

    # Student check
    if c.get("currently_studying") and not studying:
        checks.append(False)
        fail_reasons.append("Must be currently enrolled in education")
    elif c.get("currently_studying") and studying:
        checks.append(True)
        reasons.append("Currently enrolled in education ✓")

    # House type check
    house_required = c.get("house_type_required", [])
    if house_required and house_type not in house_required:
        checks.append(False)
        fail_reasons.append(f"Must be in {', '.join(house_required)} housing")

    # Land area check
    land_max = c.get("land_area_max_acres")
    if land_max is not None and land_acres > land_max:
        checks.append(False)
        fail_reasons.append(f"Land holding {land_acres} acres exceeds limit {land_max} acres")
    elif land_max is not None:
        checks.append(True)
        reasons.append(f"Land holding {land_acres} acres within limit ✓")

    if not checks:
        return True, 0.7, ["Basic eligibility criteria met"]

    is_eligible = all(checks)
    confidence = sum(checks) / len(checks)

    all_reasons = reasons if is_eligible else fail_reasons
    return is_eligible, round(confidence, 2), all_reasons


def calculate_missed_value(scheme_annual_value: int, eligible_since_date: date, today: date = None) -> Tuple[int, int]:
    """Returns (missed_months, missed_value)."""
    if not today:
        today = date.today()
    delta = today - eligible_since_date
    missed_months = max(0, (delta.days // 30) - 1)
    monthly = scheme_annual_value // 12
    return missed_months, missed_months * monthly
