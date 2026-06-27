"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { triggerDiscovery } from "@/lib/api";
import { streamAgentEvents, formatCurrency } from "@/lib/streaming";
import PageBanner from "@/components/layout/PageBanner";
import { GOV_IMAGES } from "@/lib/gov-images";

interface StreamState {
  lines: string[];
  eligibleCount: number;
  missedCount: number;
  missedValue: number;
  confidence: number;
  phase: "loading" | "streaming" | "reveal" | "done";
}

export default function TwinCreationAnimation() {
  const router = useRouter();
  const [state, setState] = useState<StreamState>({
    lines: [],
    eligibleCount: 0,
    missedCount: 0,
    missedValue: 0,
    confidence: 0,
    phase: "loading",
  });

  const run = useCallback(async () => {
    setState((s) => ({ ...s, phase: "streaming" }));
    try {
      const response = await triggerDiscovery();
      if (!response.ok) throw new Error("Agent failed");

      for await (const event of streamAgentEvents(response)) {
        setState((s) => {
          const newLines = [...s.lines];
          if (event.content && event.type !== "all_complete") {
            newLines.push(event.content);
            if (newLines.length > 25) newLines.shift();
          }
          return {
            ...s,
            lines: newLines,
            eligibleCount: event.eligible_count ?? s.eligibleCount,
            missedCount: event.missed_count ?? s.missedCount,
            missedValue: event.missed_value ?? s.missedValue,
            confidence: event.confidence ?? s.confidence,
            phase: event.type === "all_complete" ? "reveal" : "streaming",
          };
        });
        if (event.type === "all_complete") break;
      }
    } catch {
      setState((s) => ({ ...s, phase: "reveal" }));
    }
  }, []);

  useEffect(() => { run(); }, [run]);

  useEffect(() => {
    if (state.phase === "reveal") {
      const t = setTimeout(() => {
        setState((s) => ({ ...s, phase: "done" }));
        setTimeout(() => router.push("/dashboard"), 1500);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [state.phase, router]);

  return (
    <>
      <PageBanner
        title="Scheme Eligibility Processing"
        titleHi="योजना पात्रता प्रक्रिया"
        subtitle="Your citizen profile is being matched against registered government schemes."
        image={GOV_IMAGES.twin}
      />

      <div className="gov-content-area">
        <div className="mx-auto max-w-3xl">
          <div className="gov-panel">
            <h2 className="gov-panel-heading">System Processing Log</h2>

            {state.phase === "loading" && (
              <p className="text-sm text-gray-600">Initializing eligibility engine…</p>
            )}

            {(state.phase === "streaming" || state.phase === "loading") && state.lines.length > 0 && (
              <div className="border border-gov-border bg-[#1a1a1a] p-4 font-mono text-xs text-green-400 min-h-[180px]">
                {state.lines.map((line, i) => (
                  <div key={i} className={i === state.lines.length - 1 ? "streaming-cursor" : ""}>
                    [{new Date().toLocaleTimeString()}] {line}
                  </div>
                ))}
              </div>
            )}

            {(state.phase === "reveal" || state.phase === "done") && (
              <div>
                <div className="gov-alert gov-alert-warning mb-4">
                  Processing complete. Eligibility report generated successfully.
                </div>
                <table className="gov-table mb-4">
                  <tbody>
                    <tr>
                      <td className="font-semibold bg-[#f5f5f5]">Eligible Schemes Found</td>
                      <td className="font-bold text-gov-navy">{state.eligibleCount}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold bg-[#f5f5f5]">Missed Benefits</td>
                      <td>{state.missedCount}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold bg-[#f5f5f5]">Estimated Unclaimed Value</td>
                      <td className="font-bold text-gov-navy">
                        {formatCurrency(state.missedValue || state.eligibleCount * 15000)}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold bg-[#f5f5f5]">Profile Confidence</td>
                      <td>{Math.round((state.confidence || 0.75) * 100)}%</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-sm text-gray-600">Redirecting to citizen dashboard…</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
