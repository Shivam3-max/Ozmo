"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlanEditor } from "./usePlanEditor";
import { pill } from "./types";

const MODES = [
  { value: "SINGLE", label: "One day" },
  { value: "WEEK", label: "Week" },
  { value: "SEQUENCE", label: "Day sequence" },
] as const;

export default function PlanHeader({ planId, editor }: { planId: string; editor: PlanEditor }) {
  const router = useRouter();
  const { plan, locked, saving, totalItems, blockers, save, actions, setMessage } = editor;
  const [publishing, setPublishing] = useState(false);

  const status =
    saving === "saving" ? "Saving…" : saving === "saved" ? "Saved" : saving === "error" ? "Not saved" : `${totalItems} items`;

  return (
    <div className="mb-5 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-5">
      <input
        value={plan.title}
        onChange={(e) => actions.setTitle(e.target.value)}
        readOnly={locked}
        aria-label="Plan title"
        placeholder="15 Days Vegetarian Diabetes & Fatty Liver Plan"
        className="w-full border-0 bg-transparent p-0 font-[var(--font-display)] text-[24px] font-bold tracking-[-0.02em] focus:outline-none"
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Plan layout" className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              aria-pressed={plan.dayMode === m.value}
              disabled={locked}
              onClick={() => actions.setDayMode(m.value, m.value === "WEEK" ? 7 : m.value === "SEQUENCE" ? Math.max(plan.dayCount, 7) : 1)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                plan.dayMode === m.value ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--ink)]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {plan.dayMode === "SEQUENCE" && (
          <label className="flex items-center gap-2 text-[13px] text-[var(--ink-2)]">
            <input
              type="number" min={2} max={90} value={plan.dayCount} disabled={locked}
              onChange={(e) => actions.setDayMode("SEQUENCE", Math.max(2, Math.min(90, Number(e.target.value) || 2)))}
              className="tabular h-[34px] w-[70px] rounded-lg border border-[var(--line)] px-2 text-[13.5px]"
            />
            days
          </label>
        )}
        {!locked && !plan.days.some((d) => d.index === -1) && plan.dayMode !== "SINGLE" && (
          <button type="button" onClick={actions.addEveryDayColumn} className="rounded-full border border-dashed border-[var(--line)] px-3.5 py-1.5 text-[13px] text-[var(--ink-2)] hover:border-[var(--ink)]">
            + Every-day rows
          </button>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <span role="status" aria-live="polite" className={`text-[12.5px] ${saving === "error" ? "font-semibold text-[var(--alert)]" : "text-[var(--ink-3)]"}`}>
            {status}
          </span>
          {!locked && (
            <button type="button" onClick={() => void save(false)} className={pill}>Save draft</button>
          )}
          <button
            type="button"
            onClick={async () => {
              if (!locked && !(await save(false))) return;
              const res = await fetch(`/api/admin/plans/${planId}/duplicate`, { method: "POST" });
              const data = await res.json().catch(() => ({}));
              if (data?.planId) router.push(`/admin/plans/${data.planId}`);
              else setMessage(data?.error ?? "Couldn't start a new version.");
            }}
            className={pill}
            title="Copy this plan as the next version, for a follow-up revision"
          >
            {locked ? "Edit as new version" : "New version"}
          </button>
          <a
            href={`/admin/plans/${planId}/print`}
            target="_blank"
            rel="noreferrer"
            onClick={() => { if (!locked) void save(false); }}
            className={pill}
          >
            PDF
          </a>
          {!locked && (
            <button
              type="button"
              onClick={async () => {
                if (blockers.length) { setMessage("Resolve the blocking warnings before publishing."); return; }
                setPublishing(true);
                await save(true);
                setPublishing(false);
              }}
              disabled={publishing || totalItems === 0}
              className="rounded-full bg-[var(--ink)] px-4 py-2 text-[13.5px] font-semibold text-white disabled:opacity-40"
            >
              {publishing ? "Publishing…" : "Publish to client"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
