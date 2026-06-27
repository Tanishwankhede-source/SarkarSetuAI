"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getBenefit } from "@/lib/api";
import { formatCurrency } from "@/lib/streaming";
import PageBanner from "@/components/layout/PageBanner";
import { getCategoryImage } from "@/lib/gov-images";
import { getDocumentInfo } from "@/lib/documents";
import { getSchemeExtension } from "@/lib/scheme-details";
import type { Benefit } from "@/types";
import { CATEGORY_ICONS, CATEGORY_COLORS } from "@/types";
import { FileText, Clock, Phone, CheckCircle, AlertCircle } from "lucide-react";

function formatCriteria(criteria: Record<string, unknown>): { label: string; value: string }[] {
  const items: { label: string; value: string }[] = [];
  const labels: Record<string, string> = {
    min_age: "Minimum Age",
    max_age: "Maximum Age",
    max_annual_income: "Max Annual Income",
    bpl_required: "BPL Required",
    gender: "Gender",
    occupation: "Occupation",
    caste_categories: "Category",
    marital_status: "Marital Status",
    additional: "Additional Criteria",
  };
  for (const [key, val] of Object.entries(criteria)) {
    if (val === null || val === undefined || val === "all" || (Array.isArray(val) && val.includes("all"))) continue;
    const label = labels[key] || key.replace(/_/g, " ");
    let value = "";
    if (Array.isArray(val)) value = val.join(", ");
    else if (typeof val === "boolean") value = val ? "Yes" : "No";
    else if (key === "max_annual_income") value = `₹${Number(val).toLocaleString("en-IN")}`;
    else value = String(val);
    items.push({ label, value });
  }
  return items;
}

export default function BenefitDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [benefit, setBenefit] = useState<Benefit | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "steps">("overview");

  useEffect(() => {
    getBenefit(id as string).then((b) => {
      setBenefit(b as Benefit);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="gov-content-area text-gray-600 py-12 text-center">Loading scheme details…</div>;
  }

  if (!benefit) {
    return <div className="gov-content-area text-gray-600 py-12 text-center">Scheme record not found.</div>;
  }

  const score = Math.round((benefit.eligibility_score || 0) * 100);
  const docs: string[] = benefit.required_documents || [];
  const ext = benefit.scheme_slug ? getSchemeExtension(benefit.scheme_slug) : null;
  const criteria = benefit.eligibility_criteria ? formatCriteria(benefit.eligibility_criteria) : [];
  const catIcon = CATEGORY_ICONS[benefit.scheme_category] || "📋";
  const catColor = CATEGORY_COLORS[benefit.scheme_category] || "bg-gray-100 text-gray-800";
  const alreadyApplied = ["applied", "approved", "pending"].includes(benefit.status);
  const bannerImg = getCategoryImage(benefit.scheme_category);

  return (
    <>
      <PageBanner
        title={benefit.scheme_name}
        titleHi={benefit.scheme_name_hi || ext?.description_hi?.slice(0, 40) || "योजना तपशील"}
        subtitle={benefit.scheme_ministry || "Government of India Scheme"}
        image={bannerImg}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Schemes", href: "/benefits" },
          { label: "Details" },
        ]}
      />

      <div className="gov-content-area">
        {/* Hero stats row */}
        <div className="grid gap-4 lg:grid-cols-3 mb-4">
          <div className="lg:col-span-2 gov-panel !p-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="relative h-48 sm:h-auto sm:w-56 flex-shrink-0">
                <Image src={bannerImg} alt="" fill className="object-cover" sizes="224px" />
              </div>
              <div className="p-4 flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ${catColor}`}>
                    {catIcon} {benefit.scheme_category}
                  </span>
                  <span className="gov-tag">{benefit.benefit_type || "scheme"}</span>
                  {benefit.is_missed && (
                    <span className="gov-tag border-[#cc7a00] bg-[#fff8e6] text-[#7a4f00]">Missed Benefit</span>
                  )}
                </div>
                {benefit.description_en && (
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">{benefit.description_en}</p>
                )}
                {ext?.description_hi && (
                  <p className="font-devanagari text-sm text-gray-600 leading-relaxed">{ext.description_hi}</p>
                )}
              </div>
            </div>
          </div>

          <div className="gov-panel space-y-3">
            <div className="gov-stat-box">
              <span className="text-xs text-gray-500">Annual Benefit Value</span>
              <p className="text-xl font-bold text-gov-navy">
                {benefit.benefit_value_annual ? formatCurrency(benefit.benefit_value_annual) : "As per rules"}
              </p>
            </div>
            <div className="gov-stat-box">
              <span className="text-xs text-gray-500">Eligibility Match</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-gov-green rounded-full" style={{ width: `${score}%` }} />
                </div>
                <span className="font-bold text-gov-navy">{score}%</span>
              </div>
            </div>
            {ext && (
              <>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock size={14} /> {ext.processing_time}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone size={14} /> Helpline: {ext.helpline}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Key highlights */}
        {ext?.key_highlights && (
          <div className="grid gap-3 sm:grid-cols-3 mb-4">
            {ext.key_highlights.map((h, i) => (
              <div key={i} className="gov-panel !py-3 !px-4 flex items-start gap-2">
                <CheckCircle size={16} className="text-gov-green mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gov-navy">{h.en}</p>
                  <p className="font-devanagari text-xs text-gray-500">{h.hi}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {benefit.benefit_description && (
          <div className="gov-alert mb-4 border-green-700 bg-green-50 text-green-900">
            <strong>What You Get:</strong> {benefit.benefit_description}
          </div>
        )}

        {benefit.is_missed && benefit.eligible_since && (
          <div className="gov-alert gov-alert-warning mb-4 flex items-start gap-2">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              Eligible since {new Date(benefit.eligible_since).toLocaleDateString("en-IN")}
              {benefit.missed_months > 0 && ` — approximately ${benefit.missed_months} months unclaimed (${formatCurrency(benefit.missed_value_est)}).`}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gov-border mb-4">
          {(["overview", "documents", "steps"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? "border-gov-saffron text-gov-navy"
                  : "border-transparent text-gray-500 hover:text-gov-navy"
              }`}
            >
              {tab === "overview" ? "Overview" : tab === "documents" ? `Documents (${docs.length})` : "How to Apply"}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid gap-4 lg:grid-cols-2">
            {(benefit.eligibility_reasons || []).length > 0 && (
              <div className="gov-panel">
                <h2 className="gov-panel-heading">Why You Qualify</h2>
                <ul className="space-y-2">
                  {benefit.eligibility_reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={15} className="text-gov-green mt-0.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {criteria.length > 0 && (
              <div className="gov-panel">
                <h2 className="gov-panel-heading">Scheme Eligibility Rules</h2>
                <table className="gov-table text-sm">
                  <tbody>
                    {criteria.map((c, i) => (
                      <tr key={i}>
                        <td className="w-2/5 bg-[#f5f5f5] font-semibold capitalize">{c.label}</td>
                        <td className="capitalize">{c.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-3">
            <div className="gov-alert border-blue-700 bg-blue-50 text-blue-900 text-sm">
              <FileText size={16} className="inline mr-1" />
              Prepare all documents before starting your application. You will need to upload each document during the application process.
            </div>
            {docs.map((slug, i) => {
              const info = getDocumentInfo(slug);
              return (
                <div key={slug} className="gov-panel flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gov-navy text-white text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gov-navy">{info.label_en}</h3>
                    <p className="font-devanagari text-xs text-gray-500">{info.label_hi}</p>
                    <p className="mt-1 text-sm text-gray-700">{info.description_en}</p>
                    <p className="font-devanagari mt-1 text-xs text-gray-600">{info.description_hi}</p>
                    <div className="mt-2 rounded bg-[#f0f7ff] border border-blue-200 px-3 py-2 text-xs">
                      <strong>Where to get:</strong> {info.where_to_get_en}
                      <br />
                      <span className="font-devanagari text-gray-600">{info.where_to_get_hi}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "steps" && ext && (
          <div className="space-y-0">
            {ext.application_steps.map((step, i) => (
              <div key={step.step} className="flex gap-4 pb-6 relative">
                {i < ext.application_steps.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gov-border" />
                )}
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gov-saffron text-white text-sm font-bold z-10">
                  {step.step}
                </div>
                <div className="gov-panel flex-1 !py-3">
                  <h3 className="font-semibold text-gov-navy">{step.title_en}</h3>
                  <p className="font-devanagari text-xs text-gray-500">{step.title_hi}</p>
                  <p className="mt-1 text-sm text-gray-700">{step.detail_en}</p>
                  <p className="font-devanagari mt-1 text-xs text-gray-600">{step.detail_hi}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Apply CTA */}
        <div className="gov-panel mt-4 border-2 border-gov-saffron">
          <h2 className="gov-panel-heading">Ready to Apply?</h2>
          {alreadyApplied ? (
            <div>
              <p className="mb-2 text-sm text-green-800 font-semibold">
                Application {benefit.status === "approved" ? "approved" : "submitted"}.
                {benefit.application_ref && <> Ref: <strong className="font-mono">{benefit.application_ref}</strong></>}
              </p>
              <Link href="/applications" className="gov-btn-primary no-underline">Track Application</Link>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-600">
                Complete the application form with your details and upload all {docs.length} required documents.
                Your application will only be submitted after you review and confirm everything.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href={`/benefits/${benefit.id}/apply`} className="gov-btn-saffron no-underline">
                  Start Application →
                </Link>
                {benefit.application_url && (
                  <a href={benefit.application_url} target="_blank" rel="noopener noreferrer" className="gov-btn-outline no-underline">
                    Official Portal ↗
                  </a>
                )}
                <button type="button" onClick={() => router.back()} className="gov-btn-outline">
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
