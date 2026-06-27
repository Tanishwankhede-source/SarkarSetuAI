"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getMissed } from "@/lib/api";
import { formatCurrency } from "@/lib/streaming";
import PageBanner from "@/components/layout/PageBanner";
import { GOV_IMAGES } from "@/lib/gov-images";
import type { Benefit } from "@/types";

export default function MissedBenefitsPage() {
  const [missed, setMissed] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMissed().then((b) => { setMissed(b as Benefit[]); setLoading(false); });
  }, []);

  const total = missed.reduce((s, b) => s + (b.missed_value_est || 0), 0);

  return (
    <>
      <PageBanner
        title="Missed Benefits Report"
        titleHi="चुकलेले लाभ अहवाल"
        subtitle="Schemes you were eligible for but have not yet claimed."
        image={GOV_IMAGES.missed}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Missed Benefits" },
        ]}
      />

      <div className="gov-content-area">
        {loading ? (
          <p className="text-gray-600">Loading report…</p>
        ) : missed.length === 0 ? (
          <div className="gov-panel text-center text-gray-600">
            <p className="font-semibold text-gov-navy">No missed benefits detected.</p>
            <p className="mt-1 text-sm">Your profile is up to date with current scheme eligibility.</p>
          </div>
        ) : (
          <>
            <div className="gov-alert gov-alert-warning mb-6 text-center">
              <p className="text-lg font-bold">{formatCurrency(total)}</p>
              <p>Estimated unclaimed support across {missed.length} scheme{missed.length !== 1 ? "s" : ""}</p>
            </div>

            <table className="gov-table bg-white">
              <thead>
                <tr>
                  <th>Scheme Name</th>
                  <th>Ministry</th>
                  <th>Eligible Since</th>
                  <th>Months Missed</th>
                  <th>Est. Unclaimed</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {missed.map((b) => (
                  <tr key={b.id}>
                    <td className="font-semibold text-gov-navy">{b.scheme_name}</td>
                    <td className="text-xs">{b.scheme_ministry || "—"}</td>
                    <td>{b.eligible_since ? new Date(b.eligible_since).toLocaleDateString("en-IN") : "—"}</td>
                    <td>{b.missed_months || 0}</td>
                    <td className="font-bold">{formatCurrency(b.missed_value_est || 0)}</td>
                    <td>
                      <Link href={`/benefits/${b.id}`} className="gov-btn-primary text-xs px-3 py-1 no-underline">
                        Apply
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-4 text-xs text-gray-500">
              Estimates are based on standard scheme benefit values. Actual amounts may vary by state rules.
            </p>
          </>
        )}
      </div>
    </>
  );
}
