"""Seed the database with schemes and demo data."""
import asyncio
import json
import os
import sys
from datetime import date, datetime
from pathlib import Path

import asyncpg

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://sarkarsetu:sarkarsetu_pass@localhost/sarkarsetu")


async def seed():
    # Strip asyncpg prefix if needed
    url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(url)

    # Load schemes
    schemes_path = Path(__file__).parent / "schemes.json"
    with open(schemes_path) as f:
        schemes = json.load(f)

    print(f"Seeding {len(schemes)} schemes...")
    for s in schemes:
        await conn.execute("""
            INSERT INTO schemes (slug, name_en, name_hi, category, ministry, level, state,
                description_en, eligibility_criteria, required_documents, benefit_description,
                benefit_value_annual, benefit_type, application_url)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11,$12,$13,$14)
            ON CONFLICT (slug) DO UPDATE SET
                name_en = EXCLUDED.name_en,
                eligibility_criteria = EXCLUDED.eligibility_criteria,
                benefit_value_annual = EXCLUDED.benefit_value_annual
        """,
            s["slug"], s["name_en"], s.get("name_hi"), s["category"],
            s.get("ministry"), s.get("level", "central"), s.get("state"),
            s.get("description_en"), json.dumps(s["eligibility_criteria"]),
            json.dumps(s.get("required_documents", [])),
            s.get("benefit_description"), s.get("benefit_value_annual", 0),
            s.get("benefit_type"), s.get("application_url")
        )

    # Demo citizen - Meera Patil
    demo_phone = "+919876543210"
    existing = await conn.fetchrow("SELECT id FROM citizens WHERE phone=$1", demo_phone)
    if not existing:
        cid = await conn.fetchval("""
            INSERT INTO citizens (phone, phone_verified) VALUES ($1, true) RETURNING id
        """, demo_phone)

        await conn.execute("""
            INSERT INTO citizen_profiles (
                citizen_id, full_name, age, gender, state, district,
                annual_income, bpl_card, ration_card_type, occupation, employment_status,
                house_type, has_bank_account, has_jan_dhan, caste_category,
                family_size, marital_status, num_children, children_ages,
                education_level, confidence_score
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
        """,
            cid, "Meera Patil", 34, "female", "maharashtra", "mumbai",
            84000, True, "bpl", "homemaker", "unemployed",
            "semi_pucca", True, True, "obc",
            3, "widowed", 2, [6, 9],
            "secondary", 0.82
        )

        # Life event - husband passed
        await conn.execute("""
            INSERT INTO life_events (citizen_id, event_type, event_date, source)
            VALUES ($1, 'spouse_death', $2, 'citizen_reported')
        """, cid, date(2023, 3, 15))

        print(f"Demo citizen Meera Patil created: {cid}")
    else:
        print("Demo citizen already exists")

    # Pre-computed welfare gaps for government dashboard
    scheme_ids = await conn.fetch("SELECT id, slug FROM schemes")
    slug_to_id = {row["slug"]: row["id"] for row in scheme_ids}

    gap_data = [
        ("maharashtra", "nashik", "pm-awas-yojana-urban", 14382, 6219, "documents", 2437800000, "critical"),
        ("maharashtra", "nashik", "ayushman-bharat-pmjay", 28000, 11200, "awareness", 3360000000, "critical"),
        ("maharashtra", "pune", "nsap-widow-pension", 8420, 2105, "documents", 201600000, "high"),
        ("maharashtra", "mumbai", "pmsby", 125000, 87500, "awareness", 750000000, "high"),
        ("maharashtra", "nagpur", "pm-kisan-samman-nidhi", 45200, 31640, "documents", 81360000, "medium"),
        ("uttar pradesh", "lucknow", "pm-awas-yojana-gramin", 89000, 31150, "access", 6936000000, "critical"),
        ("uttar pradesh", "varanasi", "ayushman-bharat-pmjay", 156000, 54600, "awareness", 50700000000, "critical"),
        ("rajasthan", "jaipur", "pm-mudra-yojana", 34000, 17000, "awareness", 340000000000, "high"),
        ("bihar", "patna", "nsap-widow-pension", 62000, 15500, "access", 2790000000, "critical"),
        ("west bengal", "kolkata", "pm-kisan-samman-nidhi", 78000, 43680, "documents", 206640000, "medium"),
    ]

    for state, district, slug, eligible, enrolled, barrier, gap_val, severity in gap_data:
        scheme_id = slug_to_id.get(slug)
        if scheme_id:
            gap = eligible - enrolled
            rate = round(enrolled / eligible * 100, 2) if eligible > 0 else 0
            await conn.execute("""
                INSERT INTO welfare_gaps (state, district, scheme_id, total_eligible,
                    total_enrolled, enrollment_rate, coverage_gap, primary_barrier,
                    estimated_gap_value, gap_severity)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                ON CONFLICT DO NOTHING
            """, state, district, scheme_id, eligible, enrolled, rate, gap, barrier, gap_val, severity)

    print("Welfare gaps seeded")
    await conn.close()
    print("✅ Database seeded successfully")


if __name__ == "__main__":
    asyncio.run(seed())
