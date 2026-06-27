"use client";
import { useEffect, useState, Fragment } from "react";
import { getAgentLog, triggerDiscovery } from "@/lib/api";
import { streamAgentEvents } from "@/lib/streaming";
import AgentActivityPanel from "@/components/agents/AgentActivityPanel";
import PageBanner from "@/components/layout/PageBanner";
import { GOV_IMAGES } from "@/lib/gov-images";
import type { AgentExecution, AgentEvent } from "@/types";

const AGENT_META: Record<string, { label: string; desc: string }> = {
  profile_agent: { label: "Profile Module", desc: "Citizen profile validation and twin update" },
  discovery_agent: { label: "Scheme Discovery", desc: "Eligibility matching against scheme database" },
  missed_benefits_agent: { label: "Missed Benefits", desc: "Historical unclaimed benefit analysis" },
  advocate_agent: { label: "Appeal Module", desc: "Rejection parsing and appeal generation" },
};

function duration(ms?: number) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function AgentsPage() {
  const [log, setLog] = useState<AgentExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveEvents, setLiveEvents] = useState<AgentEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadLog = async () => {
    setLoading(true);
    try {
      const data = await getAgentLog();
      setLog(data as AgentExecution[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLog(); }, []);

  const handleRescan = async () => {
    setRunning(true);
    setLiveEvents([]);
    try {
      const response = await triggerDiscovery();
      for await (const ev of streamAgentEvents(response)) {
        setLiveEvents((prev) => [...prev, ev]);
        if (ev.type === "all_complete") break;
      }
      await loadLog();
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <PageBanner
        title="System Activity Log"
        titleHi="प्रणाली कार्य नोंद"
        subtitle="Audit trail of eligibility processing modules and scheme matching runs."
        image={GOV_IMAGES.agents}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "System Log" },
        ]}
      />

      <div className="gov-content-area space-y-4">
        <div className="gov-panel flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600">Run full scheme matching against your updated profile.</p>
          <div className="flex gap-2">
            <button type="button" onClick={loadLog} className="gov-btn-outline text-sm">Refresh Log</button>
            <button type="button" onClick={handleRescan} disabled={running} className="gov-btn-saffron text-sm disabled:opacity-50">
              {running ? "Running…" : "Run Scheme Matching"}
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(AGENT_META).map(([key, meta]) => {
            const last = log.find((e) => e.agent_name === key);
            return (
              <div key={key} className="gov-panel">
                <p className="text-sm font-bold text-gov-navy">{meta.label}</p>
                <p className="mt-1 text-xs text-gray-600">{meta.desc}</p>
                {last && (
                  <p className="mt-2 text-xs text-gray-500">
                    Last: {new Date(last.started_at).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {(liveEvents.length > 0 || running) && (
          <AgentActivityPanel events={liveEvents} isRunning={running} />
        )}

        <div className="gov-panel">
          <h2 className="gov-panel-heading">Execution History</h2>
          {loading ? (
            <p className="text-gray-600">Loading…</p>
          ) : log.length === 0 ? (
            <p className="text-gray-600">No processing runs recorded yet.</p>
          ) : (
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Started</th>
                  <th>Output</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {log.map((exec) => (
                  <Fragment key={exec.id}>
                    <tr>
                      <td>{AGENT_META[exec.agent_name]?.label || exec.agent_name}</td>
                      <td><span className="gov-tag">{exec.status}</span></td>
                      <td>{duration(exec.duration_ms)}</td>
                      <td className="text-xs">{exec.started_at ? new Date(exec.started_at).toLocaleString("en-IN") : "—"}</td>
                      <td className="max-w-xs truncate text-xs">{exec.output_summary || "—"}</td>
                      <td>
                        <button
                          type="button"
                          className="text-sm text-gov-link hover:underline"
                          onClick={() => setExpanded(expanded === exec.id ? null : exec.id)}
                        >
                          {expanded === exec.id ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                    {expanded === exec.id && exec.reasoning_log && (
                      <tr>
                        <td colSpan={6} className="bg-[#1a1a1a] p-3 font-mono text-xs text-green-400 whitespace-pre-wrap">
                          {exec.reasoning_log}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
