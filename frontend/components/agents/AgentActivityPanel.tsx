"use client";
import { useEffect, useRef } from "react";
import type { AgentEvent } from "@/types";

interface Props {
  events: AgentEvent[];
  isRunning: boolean;
}

const AGENT_LABELS: Record<string, string> = {
  profile_agent: "Profile Module",
  discovery_agent: "Scheme Discovery",
  missed_benefits_agent: "Missed Benefits",
  advocate_agent: "Appeal Module",
};

export default function AgentActivityPanel({ events, isRunning }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  return (
    <div className="border border-gov-border bg-white">
      <div className="border-b border-gov-border bg-[#f5f5f5] px-4 py-2">
        <p className="text-sm font-bold text-gov-navy">System Processing Log</p>
        <p className="text-xs text-gray-600">
          {isRunning ? "Processing in progress…" : events.length ? `${events.length} log entries` : "Idle"}
        </p>
      </div>

      <div className="max-h-80 overflow-y-auto bg-[#1a1a1a] p-4 font-mono text-xs text-green-400">
        {events.length === 0 ? (
          <p className="text-gray-500">No log entries.</p>
        ) : (
          events.map((ev, i) => (
            <div key={i} className="mb-1.5 break-words">
              <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
              {ev.agent && (
                <span className="text-yellow-400"> [{AGENT_LABELS[ev.agent] || ev.agent}]</span>
              )}
              <span className={ev.type === "error" ? " text-red-400" : ""}> {ev.content}</span>
              {isRunning && i === events.length - 1 && <span className="streaming-cursor" />}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
