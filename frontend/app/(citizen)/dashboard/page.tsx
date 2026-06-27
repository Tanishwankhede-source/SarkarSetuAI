"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSummary, getEligible, getAgentStatus } from "@/lib/api";
import { formatCurrency } from "@/lib/streaming";
import MissedBenefitBanner from "@/components/benefits/MissedBenefitBanner";
import BenefitCard from "@/components/benefits/BenefitCard";
import PageBanner from "@/components/layout/PageBanner";
import { GOV_IMAGES } from "@/lib/gov-images";
import type { CitizenSummary, Benefit } from "@/types";

export default function DashboardPage() {
  const [summary, setSummary] = useState<CitizenSummary | null>(null);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [agentStatus, setAgentStatus] = useState<{ agents: Array<{ agent_name: string; last_run: string; last_status: string }> }>({ agents: [] });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [s, b, a] = await Promise.all([getSummary(), getEligible(), getAgentStatus()]);
      setSummary(s as CitizenSummary);
      setBenefits((b as Benefit[]).slice(0, 6));
      setAgentStatus(a as typeof agentStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="gov-content-area text-center text-gray-600">
        Loading citizen dashboard…
      </div>
    );
  }

  const firstName = summary?.full_name?.split(" ")[0] || "Citizen";

  return (
    <>
      <PageBanner
        title={`Welcome, ${firstName}`}
        titleHi="नागरिक डॅशबोर्ड"
        subtitle={`Profile confidence: ${Math.round((summary?.confidence_score || 0) * 100)}% | Review your matched schemes and pending applications.`}
        image={GOV_IMAGES.dashboard}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Dashboard" },
        ]}
      />

      <div className="gov-content-area space-y-6">
        {(summary?.missed_count || 0) > 0 && (
          <MissedBenefitBanner
            missedCount={summary?.missed_count || 0}
            missedValue={summary?.missed_value || 0}
          />
        )}

        <div className="grid grid-cols-2 gap-0 divide-x divide-gov-border border border-gov-border bg-white sm:grid-cols-4">
          {[
            { label: "Eligible Schemes", val: summary?.eligible_count || 0 },
            { label: "Missed Benefits", val: summary?.missed_count || 0 },
            { label: "Unclaimed Value", val: formatCurrency(summary?.missed_value || 0) },
            { label: "Applications", val: (summary?.applied_count || 0) + (summary?.approved_count || 0) },
          ].map(({ label, val }) => (
            <div key={label} className="gov-stat-box border-0 py-4">
              <div className="gov-stat-value text-lg sm:text-2xl">{val}</div>
              <div className="gov-stat-label normal-case">{label}</div>
            </div>
          ))}
        </div>

        <div className="gov-panel">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gov-border pb-2">
            <h2 className="text-base font-bold text-gov-navy">Matched Government Schemes</h2>
            <Link href="/benefits" className="text-sm font-semibold text-gov-link no-underline hover:underline">
              View All Schemes →
            </Link>
          </div>

          {benefits.length === 0 ? (
            <div className="py-8 text-center text-gray-600">
              <p className="mb-3">No schemes matched yet. Run eligibility processing to discover benefits.</p>
              <Link href="/onboarding/twin" className="gov-btn-saffron no-underline">Run Scheme Matching</Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((b) => <BenefitCard key={b.id} benefit={b} showMissed />)}
            </div>
          )}
        </div>

        <div className="gov-panel">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gov-border pb-2">
            <h2 className="text-base font-bold text-gov-navy">System Activity Status</h2>
            <Link href="/agents" className="text-sm font-semibold text-gov-link no-underline hover:underline">
              Full Log →
            </Link>
          </div>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Last Run</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {["profile_agent", "discovery_agent", "missed_benefits_agent", "advocate_agent"].map((name) => {
                const a = agentStatus.agents.find((ag) => ag.agent_name === name);
                return (
                  <tr key={name}>
                    <td className="capitalize">{name.replace(/_agent$/, "").replace(/_/g, " ")}</td>
                    <td>{a ? new Date(a.last_run).toLocaleString("en-IN") : "—"}</td>
                    <td>
                      <span className={`gov-tag ${a?.last_status === "completed" ? "gov-tag-active" : ""}`}>
                        {a?.last_status || "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
