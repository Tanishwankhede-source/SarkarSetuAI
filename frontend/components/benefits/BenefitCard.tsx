import Link from "next/link";
import Image from "next/image";
import type { Benefit } from "@/types";
import { formatCurrency } from "@/lib/streaming";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/types";
import { getCategoryImage } from "@/lib/gov-images";

interface Props {
  benefit: Benefit;
  showMissed?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  health: "Health",
  education: "Education",
  housing: "Housing",
  agriculture: "Agriculture",
  finance: "Finance",
  insurance: "Insurance",
  welfare: "Welfare",
  employment: "Employment",
  skill: "Skill Development",
};

export default function BenefitCard({ benefit, showMissed }: Props) {
  const score = Math.round((benefit.eligibility_score || 0) * 100);
  const category = benefit.scheme_category;
  const catLabel = CATEGORY_LABELS[category] || category;
  const catColor = CATEGORY_COLORS[category] || "bg-gray-100 text-gray-800";
  const catIcon = CATEGORY_ICONS[category] || "📋";
  const img = getCategoryImage(category);
  const docCount = (benefit.required_documents || []).length;

  return (
    <Link href={`/benefits/${benefit.id}`} className="block no-underline hover:no-underline group">
      <article className="benefit-card h-full flex flex-col overflow-hidden">
        <div className="relative h-36 w-full overflow-hidden">
          <Image
            src={img}
            alt={benefit.scheme_name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gov-navy/80 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
            <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ${catColor}`}>
              <span>{catIcon}</span> {catLabel}
            </span>
            <span className="rounded bg-white/90 px-2 py-0.5 text-xs font-bold text-gov-navy">{score}% match</span>
          </div>
          {benefit.is_missed && showMissed && (
            <span className="absolute top-2 right-2 rounded bg-[#cc7a00] px-2 py-0.5 text-xs font-bold text-white">
              Missed Benefit
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          {benefit.scheme_name_hi && (
            <p className="font-devanagari text-xs text-gray-500 mb-0.5">{benefit.scheme_name_hi}</p>
          )}
          <h3 className="mb-1 flex-1 text-sm font-bold leading-snug text-gov-navy line-clamp-2">
            {benefit.scheme_name}
          </h3>
          {benefit.scheme_ministry && (
            <p className="mb-2 truncate text-xs text-gray-500">{benefit.scheme_ministry}</p>
          )}
          {benefit.description_en && (
            <p className="mb-3 text-xs text-gray-600 line-clamp-2 leading-relaxed">{benefit.description_en}</p>
          )}

          <div className="mt-auto grid grid-cols-2 gap-2 text-xs">
            <div className="rounded border border-gov-border bg-[#f8f9fa] p-2">
              <span className="block text-gray-500">Annual Value</span>
              <span className="font-bold text-gov-navy">
                {benefit.benefit_value_annual ? formatCurrency(benefit.benefit_value_annual) : "As per rules"}
              </span>
            </div>
            <div className="rounded border border-gov-border bg-[#f8f9fa] p-2">
              <span className="block text-gray-500">Documents</span>
              <span className="font-bold text-gov-navy">{docCount} required</span>
            </div>
          </div>

          {benefit.is_missed && benefit.missed_value_est > 0 && (
            <div className="mt-2 rounded border border-[#cc7a00] bg-[#fff8e6] px-2 py-1.5 text-xs text-[#7a4f00]">
              Unclaimed: <strong>{formatCurrency(benefit.missed_value_est)}</strong>
            </div>
          )}

          <div className="mt-3 text-center">
            <span className="text-xs font-semibold text-gov-saffron group-hover:underline">
              View Details & Apply →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
