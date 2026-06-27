"use client";
import { useEffect, useState } from "react";
import { getEligible } from "@/lib/api";
import BenefitCard from "@/components/benefits/BenefitCard";
import PageBanner from "@/components/layout/PageBanner";
import { GOV_IMAGES } from "@/lib/gov-images";
import { formatCurrency } from "@/lib/streaming";
import type { Benefit } from "@/types";
import { Search, Mic } from "lucide-react";

const CATEGORIES = ["all", "health", "education", "housing", "agriculture", "finance", "insurance", "welfare", "employment", "skill"];

const CAT_LABELS: Record<string, string> = {
  all: "All Schemes",
  health: "Health",
  education: "Education",
  housing: "Housing",
  agriculture: "Agriculture",
  finance: "Finance",
  insurance: "Insurance",
  welfare: "Welfare",
  employment: "Employment",
  skill: "Skill",
};

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [filtered, setFiltered] = useState<Benefit[]>([]);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEligible().then((b) => {
      setBenefits(b as Benefit[]);
      setFiltered(b as Benefit[]);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let list = benefits;
    if (category !== "all") list = list.filter((b) => b.scheme_category === category);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((b) =>
        b.scheme_name.toLowerCase().includes(q) ||
        (b.scheme_name_hi || "").includes(query) ||
        (b.description_en || "").toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [category, query, benefits]);

  const totalValue = benefits.reduce((s, b) => s + (b.benefit_value_annual || 0), 0);
  const missedCount = benefits.filter((b) => b.is_missed).length;

  return (
    <>
      <PageBanner
        title="Eligible Government Schemes"
        titleHi="पात्र सरकारी योजना"
        subtitle={loading ? "Loading…" : `${benefits.length} schemes matched to your citizen profile`}
        image={GOV_IMAGES.benefits}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Schemes" },
        ]}
      />

      <div className="gov-content-area">
        {!loading && (
          <div className="grid gap-3 sm:grid-cols-3 mb-4">
            <div className="gov-stat-box">
              <p className="gov-stat-value">{benefits.length}</p>
              <p className="gov-stat-label">Eligible Schemes</p>
            </div>
            <div className="gov-stat-box">
              <p className="gov-stat-value">{formatCurrency(totalValue)}</p>
              <p className="gov-stat-label">Total Annual Value</p>
            </div>
            <div className="gov-stat-box">
              <p className="gov-stat-value text-[#cc7a00]">{missedCount}</p>
              <p className="gov-stat-label">Missed Benefits</p>
            </div>
          </div>
        )}

        <div className="gov-panel mb-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="gov-label" htmlFor="search">Search Scheme</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, description…"
                  className="gov-input pl-9"
                />
              </div>
            </div>
            <div>
              <label className="gov-label">Category Filter</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`gov-tag cursor-pointer ${category === cat ? "gov-tag-active" : ""}`}
                  >
                    {CAT_LABELS[cat] || cat}
                    {cat !== "all" && ` (${benefits.filter((b) => b.scheme_category === cat).length})`}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-1 text-xs text-gray-500">
            <Mic size={12} /> Tip: Use the voice assistant (bottom-right) to ask about schemes in Hindi, Marathi, or English.
          </p>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading schemes…</p>
        ) : filtered.length === 0 ? (
          <div className="gov-panel text-center text-gray-600">
            No schemes found for the selected filter.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => <BenefitCard key={b.id} benefit={b} showMissed />)}
          </div>
        )}
      </div>
    </>
  );
}
