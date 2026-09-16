"use client";

import type { PlanEditor } from "./usePlanEditor";

export default function PlanNotices({ status, editor }: { status: "DRAFT" | "ACTIVE" | "ARCHIVED"; editor: PlanEditor }) {
  const { locked, message, setMessage, warnings, blockers } = editor;
  return (
    <>
      {locked && (
        <div className="mb-4 rounded-xl border border-[var(--line)] bg-[var(--tint)] px-4 py-3 text-[14px] text-[var(--ink-2)]">
          <strong className="font-semibold text-[var(--ink)]">
            {status === "ARCHIVED" ? "This version is archived." : "This version is published."}
          </strong>{" "}
          It&rsquo;s read-only so the client never sees a half-finished edit. Use{" "}
          <strong className="font-semibold text-[var(--ink)]">Edit as new version</strong> to make changes, then publish that draft.
        </div>
      )}

      {message && (
        <div role="status" className="mb-4 flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--tint)] px-4 py-3 text-[14px]">
          <span className="flex-1">{message}</span>
          <button type="button" onClick={() => setMessage(null)} className="text-[var(--ink-3)]" aria-label="Dismiss message">✕</button>
        </div>
      )}

      {warnings.length > 0 && (
        <div className={`mb-4 rounded-xl border px-5 py-4 ${blockers.length ? "border-[var(--alert)]/30 bg-[var(--alert)]/6" : "border-[var(--watch)]/30 bg-[var(--watch)]/6"}`}>
          <p className="text-[13.5px] font-bold uppercase tracking-[0.08em]">
            {blockers.length ? `${blockers.length} blocking ${blockers.length === 1 ? "conflict" : "conflicts"}` : "Worth checking"}
          </p>
          <ul className="mt-2 grid gap-1.5">
            {warnings.slice(0, 6).map((w, i) => (
              <li key={i} className="text-[14px] text-[var(--ink-2)]">
                <strong className="font-semibold text-[var(--ink)]">{w.reason}</strong> — {w.item}{" "}
                <span className="text-[var(--ink-3)]">in {w.slot}</span>
              </li>
            ))}
          </ul>
          {warnings.length > 6 && <p className="mt-2 text-[13px] text-[var(--ink-3)]">and {warnings.length - 6} more.</p>}
        </div>
      )}
    </>
  );
}
