"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getApplications, triggerAdvocate } from "@/lib/api";
import { streamAgentEvents } from "@/lib/streaming";
import AgentActivityPanel from "@/components/agents/AgentActivityPanel";
import PageBanner from "@/components/layout/PageBanner";
import { GOV_IMAGES } from "@/lib/gov-images";
import type { Benefit, AgentEvent } from "@/types";
import { Loader2 } from "lucide-react";

function AdvocateContent() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("app");

  const [rejected, setRejected] = useState<Benefit[]>([]);
  const [selectedId, setSelectedId] = useState(preselected || "");
  const [rejectionNote, setRejectionNote] = useState("");
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    plain_explanation?: string;
    action_steps?: string[];
    appeal_letter?: string;
    can_appeal?: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getApplications().then((apps) => {
      const r = (apps as Benefit[]).filter((a) => a.status === "rejected");
      setRejected(r);
      if (preselected) setSelectedId(preselected);
      else if (r.length > 0) setSelectedId(r[0].id);
    });
  }, [preselected]);

  const handleRun = async () => {
    if (!selectedId) return;
    setRunning(true);
    setEvents([]);
    setResult(null);
    try {
      const response = await triggerAdvocate(selectedId, rejectionNote);
      for await (const ev of streamAgentEvents(response)) {
        setEvents((prev) => [...prev, ev]);
        if (ev.type === "complete" && ev.result) {
          setResult(ev.result as typeof result);
        }
      }
    } catch {
      setEvents((prev) => [...prev, { type: "error", content: "Appeal module failed. Please try again." }]);
    } finally {
      setRunning(false);
    }
  };

  const copyLetter = () => {
    if (result?.appeal_letter) {
      navigator.clipboard.writeText(result.appeal_letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selected = rejected.find((r) => r.id === selectedId);

  return (
    <>
      <PageBanner
        title="Appeal & Grievance Support"
        titleHi="अपील व तक्रार निवारण"
        subtitle="Generate structured appeal letters and next steps for rejected scheme applications."
        image={GOV_IMAGES.advocate}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Appeal" },
        ]}
      />

      <div className="gov-content-area space-y-4">
        <div className="gov-panel">
          <h2 className="gov-panel-heading">Select Rejected Application</h2>
          {rejected.length === 0 ? (
            <p className="text-sm text-gray-600">No rejected applications found. This service activates when an application is rejected.</p>
          ) : (
            <>
              <label className="gov-label" htmlFor="app-select">Application</label>
              <select
                id="app-select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="gov-input mb-4"
              >
                {rejected.map((r) => (
                  <option key={r.id} value={r.id}>{r.scheme_name}</option>
                ))}
              </select>

              {selected?.rejection_reason && (
                <div className="gov-alert mb-4 border-red-700 bg-red-50 text-red-900">
                  <strong>Rejection reason:</strong> {selected.rejection_reason}
                </div>
              )}

              <label className="gov-label" htmlFor="notes">Additional Information (Optional)</label>
              <textarea
                id="notes"
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                rows={3}
                className="gov-input mb-4 resize-none"
                placeholder="Provide any additional details about your case…"
              />

              <button
                type="button"
                onClick={handleRun}
                disabled={running || !selectedId}
                className="gov-btn-primary disabled:opacity-50"
              >
                {running ? "Processing…" : "Generate Appeal Support"}
              </button>
            </>
          )}
        </div>

        {(events.length > 0 || running) && (
          <AgentActivityPanel events={events} isRunning={running} />
        )}

        {result && (
          <div className="space-y-4">
            {result.plain_explanation && (
              <div className="gov-panel">
                <h2 className="gov-panel-heading">Summary</h2>
                <p className="text-sm text-gray-700">{result.plain_explanation}</p>
              </div>
            )}
            {(result.action_steps || []).length > 0 && (
              <div className="gov-panel">
                <h2 className="gov-panel-heading">Recommended Next Steps</h2>
                <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-700">
                  {result.action_steps!.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
            )}
            {result.appeal_letter && result.can_appeal && (
              <div className="gov-panel">
                <div className="mb-3 flex items-center justify-between border-b border-gov-border pb-2">
                  <h2 className="text-base font-bold text-gov-navy">Draft Appeal Letter</h2>
                  <button type="button" onClick={copyLetter} className="gov-btn-outline text-xs py-1">
                    {copied ? "Copied" : "Copy to Clipboard"}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap border border-gov-border bg-[#fafafa] p-4 text-xs text-gray-800">
                  {result.appeal_letter}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function AdvocatePage() {
  return (
    <Suspense fallback={<div className="gov-content-area text-gray-600">Loading…</div>}>
      <AdvocateContent />
    </Suspense>
  );
}
