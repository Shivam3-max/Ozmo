"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STAGES = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "CONSULTATION_BOOKED", label: "Consultation booked" },
  { value: "CONSULTED", label: "Consulted" },
  { value: "CONVERTED", label: "Converted" },
  { value: "LOST", label: "Lost" },
];

const LOST_REASONS = ["Price", "Went elsewhere", "Not ready", "No response", "Not a fit", "Distance", "Other"];

export default function StageControl({ leadId, stage }: { leadId: string; stage: string }) {
  const router = useRouter();
  const [value, setValue] = useState(stage);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const needsReason = value === "LOST";

  return (
    <form
      className="grid gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        setError(null);
        setSaved(false);
        try {
          const res = await fetch(`/api/admin/leads/${leadId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stage: value, lostReason: needsReason ? reason : undefined, note }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setError(data?.error ?? "Couldn't update this lead.");
          } else {
            setSaved(true);
            setNote("");
            router.refresh();
          }
        } catch {
          setError("Couldn't reach the server.");
        }
        setBusy(false);
      }}
    >
      <label className="grid gap-1.5">
        <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Stage</span>
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-[42px] rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 text-[14.5px]"
        >
          {STAGES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </label>

      {needsReason && (
        <label className="grid gap-1.5">
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Why lost</span>
          <select
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[42px] rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 text-[14.5px]"
          >
            <option value="">Choose a reason</option>
            {LOST_REASONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
      )}

      <label className="grid gap-1.5">
        <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">
          Note <span className="font-normal normal-case tracking-normal">(optional)</span>
        </span>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Called, no answer. Trying again Thursday."
          className="rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3 text-[14.5px] leading-relaxed"
        />
      </label>

      {error && <p role="alert" className="text-[13.5px] text-[var(--alert)]">{error}</p>}
      {saved && <p className="text-[13.5px] text-[var(--good)]">Saved.</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-1 inline-flex min-h-[42px] items-center justify-center rounded-full bg-[var(--ink)] px-5 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#163B4D] disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
