from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text


async def get_overview(db: AsyncSession) -> dict:
    r = await db.execute(text("SELECT COUNT(*) FROM citizens"))
    total_citizens = r.scalar() or 0

    r = await db.execute(text("SELECT COUNT(*) FROM schemes WHERE is_active=true"))
    total_schemes = r.scalar() or 0

    r = await db.execute(text("SELECT COUNT(*) FROM citizen_benefits WHERE status IN ('eligible','discovered')"))
    total_matches = r.scalar() or 0

    r = await db.execute(text("SELECT COALESCE(SUM(missed_value_est),0) FROM citizen_benefits WHERE is_missed=true"))
    missed_val = r.scalar() or 0

    r = await db.execute(text("SELECT COALESCE(AVG(enrollment_rate),0) FROM welfare_gaps"))
    avg_rate = float(r.scalar() or 0)

    r = await db.execute(text("SELECT COUNT(*) FROM welfare_gaps WHERE gap_severity='critical'"))
    critical = r.scalar() or 0

    return {
        "total_citizens": total_citizens,
        "total_schemes": total_schemes,
        "total_eligible_matches": total_matches,
        "total_missed_value": int(missed_val),
        "avg_enrollment_rate": round(avg_rate, 2),
        "critical_gaps": critical,
    }


async def get_welfare_gaps(db: AsyncSession, state: str = None, limit: int = 50) -> list:
    where = "WHERE wg.gap_severity IS NOT NULL"
    params = {}
    if state:
        where += " AND LOWER(wg.state) = :state"
        params["state"] = state.lower()

    rows = await db.execute(text(f"""
        SELECT wg.state, wg.district, s.name_en as scheme_name, s.category as scheme_category,
               wg.total_eligible, wg.total_enrolled, wg.enrollment_rate,
               wg.coverage_gap, wg.primary_barrier, wg.estimated_gap_value, wg.gap_severity
        FROM welfare_gaps wg
        JOIN schemes s ON s.id = wg.scheme_id
        {where}
        ORDER BY wg.estimated_gap_value DESC
        LIMIT :limit
    """), {**params, "limit": limit})
    return [dict(r._mapping) for r in rows.fetchall()]


async def get_scheme_performance(db: AsyncSession) -> list:
    rows = await db.execute(text("""
        SELECT s.name_en, s.category,
               COUNT(cb.id) as total_applications,
               COUNT(CASE WHEN cb.status='approved' THEN 1 END) as approved,
               COUNT(CASE WHEN cb.status='rejected' THEN 1 END) as rejected,
               COUNT(CASE WHEN cb.is_missed=true THEN 1 END) as missed_count,
               COALESCE(SUM(cb.missed_value_est),0) as total_missed_value
        FROM schemes s
        LEFT JOIN citizen_benefits cb ON cb.scheme_id = s.id
        WHERE s.is_active = true
        GROUP BY s.id, s.name_en, s.category
        ORDER BY missed_count DESC
        LIMIT 20
    """))
    return [dict(r._mapping) for r in rows.fetchall()]
