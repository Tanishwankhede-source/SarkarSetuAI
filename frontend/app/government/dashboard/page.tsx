"use client";
import { useEffect, useState } from "react";
import { getGovOverview, getWelfareGaps, getSchemePerformance } from "@/lib/api";
import { formatCurrency } from "@/lib/streaming";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import GovPageShell from "@/components/layout/GovPageShell";
import PageBanner from "@/components/layout/PageBanner";
import { GOV_IMAGES } from "@/lib/gov-images";

const SEVERITY_LABELS: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const BARRIER_LABELS: Record<string, string> = {
  documents: "Document barriers",
  awareness: "Lack of awareness",
  access: "Physical access",
  language: "Language barrier",
};

interface Overview {
  total_citizens: number;
  total_schemes: number;
  total_eligible_matches: number;
  total_missed_value: number;
  avg_enrollment_rate: number;
  critical_gaps: number;
}
interface Gap {
  state: string;
  district: string;
  scheme_name: string;
  total_eligible: number;
  total_enrolled: number;
  enrollment_rate: number;
  coverage_gap: number;
  primary_barrier: string;
  estimated_gap_value: number;
  gap_severity: string;
}

export default function GovernmentDashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("");

  useEffect(() => {
    Promise.all([getGovOverview(), getWelfareGaps(), getSchemePerformance()]).then(([o, g]) => {
      setOverview(o as Overview);
      setGaps(g as Gap[]);
      setLoading(false);
    });
  }, []);

  const filteredGaps = stateFilter
    ? gaps.filter((g) => g.state.toLowerCase().includes(stateFilter.toLowerCase()))
    : gaps;

  const topGaps = [...filteredGaps].sort((a, b) => b.estimated_gap_value - a.estimated_gap_value).slice(0, 8);

  const barData = topGaps.map((g) => ({
    name: g.district || g.state,
    eligible: g.total_eligible,
    enrolled: g.total_enrolled,
  }));

  return (
    <GovPageShell variant="public">
      <PageBanner
        title="Government Welfare Intelligence Dashboard"
        titleHi="शासकीय कल्याण विश्लेषण"
        subtitle="State and district-level scheme enrollment gaps and welfare delivery analytics."
        image={GOV_IMAGES.government}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Government Dashboard" },
        ]}
      />

      <div className="gov-container-wide py-6 sm:py-8">
        {loading ? (
          <p className="text-gray-600">Loading dashboard data…</p>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-2 gap-0 divide-x divide-gov-border border border-gov-border bg-white sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: "Citizens Registered", val: (overview?.total_citizens || 0).toLocaleString("en-IN") },
                { label: "Active Schemes", val: (overview?.total_schemes || 0).toString() },
                { label: "Benefit Matches", val: (overview?.total_eligible_matches || 0).toLocaleString("en-IN") },
                { label: "Missed Value", val: formatCurrency(overview?.total_missed_value || 0) },
                { label: "Avg Enrollment", val: `${(overview?.avg_enrollment_rate || 0).toFixed(1)}%` },
                { label: "Critical Gaps", val: (overview?.critical_gaps || 0).toString() },
              ].map(({ label, val }) => (
                <div key={label} className="gov-stat-box border-0 py-4">
                  <div className="gov-stat-value text-lg">{val}</div>
                  <div className="gov-stat-label normal-case">{label}</div>
                </div>
              ))}
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-2">
              <div className="gov-panel">
                <h2 className="gov-panel-heading">Enrollment vs Eligible (Top Districts)</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => v.toLocaleString("en-IN")} />
                    <Bar dataKey="eligible" fill="#003366" name="Eligible" />
                    <Bar dataKey="enrolled" fill="#FF9933" name="Enrolled" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="gov-panel">
                <h2 className="gov-panel-heading">Primary Enrollment Barriers</h2>
                {["documents", "awareness", "access", "language"].map((b) => {
                  const count = gaps.filter((g) => g.primary_barrier === b).length;
                  const pct = gaps.length > 0 ? Math.round((count / gaps.length) * 100) : 0;
                  return (
                    <div key={b} className="mb-3">
                      <div className="mb-1 flex justify-between text-xs">
                        <span>{BARRIER_LABELS[b]}</span>
                        <span className="font-bold">{pct}%</span>
                      </div>
                      <div className="h-3 border border-gov-border bg-[#f5f5f5]">
                        <div className="h-full bg-gov-navy" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="gov-panel overflow-x-auto p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gov-border p-4">
                <h2 className="text-base font-bold text-gov-navy">Welfare Gap Analysis</h2>
                <input
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  placeholder="Filter by state…"
                  className="gov-input w-48 text-sm"
                />
              </div>
              <table className="gov-table">
                <thead>
                  <tr>
                    {["State", "District", "Scheme", "Eligible", "Enrolled", "Rate", "Gap Value", "Barrier", "Severity"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredGaps.slice(0, 20).map((g, i) => (
                    <tr key={i}>
                      <td className="capitalize">{g.state}</td>
                      <td className="capitalize">{g.district || "—"}</td>
                      <td className="max-w-[200px] font-semibold">{g.scheme_name}</td>
                      <td>{g.total_eligible.toLocaleString("en-IN")}</td>
                      <td>{g.total_enrolled.toLocaleString("en-IN")}</td>
                      <td>{g.enrollment_rate.toFixed(0)}%</td>
                      <td>{formatCurrency(g.estimated_gap_value)}</td>
                      <td className="text-xs">{BARRIER_LABELS[g.primary_barrier] || g.primary_barrier}</td>
                      <td><span className="gov-tag">{SEVERITY_LABELS[g.gap_severity] || g.gap_severity}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </GovPageShell>
  );
}
