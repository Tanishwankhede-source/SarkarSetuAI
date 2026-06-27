import Link from "next/link";
import { formatCurrency } from "@/lib/streaming";

interface Props {
  missedCount: number;
  missedValue: number;
}

export default function MissedBenefitBanner({ missedCount, missedValue }: Props) {
  if (missedCount === 0) return null;

  return (
    <div className="gov-alert gov-alert-warning flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-bold">
          Important Notice: {missedCount} unclaimed benefit{missedCount !== 1 ? "s" : ""} detected
        </p>
        <p className="mt-1">
          You may be eligible for approximately{" "}
          <strong>{formatCurrency(missedValue)}</strong> in government support that has not been received.
          Please review and apply at the earliest.
        </p>
      </div>
      <Link href="/benefits/missed" className="gov-btn-saffron shrink-0 text-center no-underline">
        View Details
      </Link>
    </div>
  );
}
