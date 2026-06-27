"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getApplications } from "@/lib/api";
import { formatCurrency } from "@/lib/streaming";
import PageBanner from "@/components/layout/PageBanner";
import { GOV_IMAGES } from "@/lib/gov-images";
import type { Benefit } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  applied: "Submitted",
  pending: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApplications().then((a) => { setApps(a as Benefit[]); setLoading(false); });
  }, []);

  return (
    <>
      <PageBanner
        title="Application Tracking"
        titleHi="अर्ज स्थिती"
        subtitle={`${loading ? "Loading…" : `${apps.length} application(s) on record`}`}
        image={GOV_IMAGES.applications}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Applications" },
        ]}
      />

      <div className="gov-content-area">
        {loading ? (
          <p className="text-gray-600">Loading applications…</p>
        ) : apps.length === 0 ? (
          <div className="gov-panel text-center">
            <p className="text-gray-600 mb-4">No applications submitted yet.</p>
            <Link href="/benefits" className="gov-btn-primary no-underline">Browse Schemes</Link>
          </div>
        ) : (
          <table className="gov-table bg-white">
            <thead>
              <tr>
                <th>Scheme</th>
                <th>Reference No.</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Annual Benefit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>
                  <td className="font-semibold text-gov-navy">{a.scheme_name}</td>
                  <td className="font-mono text-xs">{a.application_ref || "—"}</td>
                  <td>{a.applied_at ? new Date(a.applied_at).toLocaleDateString("en-IN") : "—"}</td>
                  <td>
                    <span className={`gov-tag ${a.status === "approved" ? "gov-tag-active" : a.status === "rejected" ? "border-red-700 bg-red-50 text-red-800" : ""}`}>
                      {STATUS_LABELS[a.status] || a.status}
                    </span>
                  </td>
                  <td>{a.benefit_value_annual ? formatCurrency(a.benefit_value_annual) : "—"}</td>
                  <td className="space-x-2">
                    <Link href={`/benefits/${a.id}`} className="text-sm text-gov-link no-underline hover:underline">View</Link>
                    {a.status === "rejected" && (
                      <Link href={`/advocate?app=${a.id}`} className="text-sm text-red-700 no-underline hover:underline">Appeal</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
