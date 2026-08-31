"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ACTIONS = [
  { status: "COMPLETED", label: "Completed", tone: "bg-[var(--good)] text-white" },
  { status: "NO_SHOW", label: "No show", tone: "border border-[var(--line)] text-[var(--ink-2)]" },
  { status: "CANCELLED", label: "Cancelled", tone: "border border-[var(--line)] text-[var(--ink-3)]" },
] as const;

export default function AppointmentActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const mark = async (status: string) => {
    setBusy(status);
    setError(false);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) setError(true);
      else router.refresh();
    } catch {
      setError(true);
    }
    setBusy(null);
  };

  return (
    <div className="flex shrink-0 flex-wrap gap-1.5">
      {ACTIONS.map((a) => (
        <button
          key={a.status}
          onClick={() => mark(a.status)}
          disabled={busy !== null}
          className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-opacity disabled:opacity-40 ${a.tone}`}
        >
          {busy === a.status ? "…" : a.label}
        </button>
      ))}
      {error && <span className="text-[12px] text-[var(--alert)]">Failed</span>}
    </div>
  );
}
