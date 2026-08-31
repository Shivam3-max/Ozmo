"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const FIELDS = [
  { k: "weightKg", label: "Weight", unit: "kg", step: "0.1" },
  { k: "waistCm", label: "Waist", unit: "cm", step: "0.5" },
  { k: "hipCm", label: "Hip", unit: "cm", step: "0.5" },
  { k: "chestCm", label: "Chest", unit: "cm", step: "0.5" },
  { k: "armCm", label: "Arm", unit: "cm", step: "0.5" },
  { k: "bodyFatPct", label: "Body fat", unit: "%", step: "0.1" },
] as const;

export default function AddMeasurement({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<Record<string, string>>({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-[13.5px] font-semibold hover:border-[var(--ink)]"
      >
        + Record measurement
      </button>
    );
  }

  return (
    <form
      className="grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true); setError(null);
        try {
          const res = await fetch(`/api/admin/clients/${clientId}/measurements`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...v, date, note }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) { setError(data?.error ?? "Couldn't save."); setBusy(false); return; }
          setV({}); setNote(""); setOpen(false);
          router.refresh();
        } catch {
          setError("Couldn't reach the server.");
        }
        setBusy(false);
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold">Record measurement</p>
        <button type="button" onClick={() => setOpen(false)} className="text-[var(--ink-3)]">✕</button>
      </div>

      <label className="grid gap-1.5">
        <span className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Date</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="min-h-[38px] rounded-lg border border-[var(--line)] px-3 text-[14px]" />
      </label>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {FIELDS.map((f) => (
          <label key={f.k} className="grid gap-1.5">
            <span className="text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--ink-3)]">
              {f.label} <span className="font-normal normal-case">{f.unit}</span>
            </span>
            <input
              type="number" step={f.step} min={0}
              value={v[f.k] ?? ""}
              onChange={(e) => setV((p) => ({ ...p, [f.k]: e.target.value }))}
              className="tabular min-h-[38px] rounded-lg border border-[var(--line)] px-3 text-[14px]"
            />
          </label>
        ))}
      </div>

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note — e.g. taken after the follow-up"
        className="min-h-[38px] rounded-lg border border-[var(--line)] px-3 text-[14px]"
      />

      {error && <p role="alert" className="text-[13.5px] text-[var(--alert)]">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-fit rounded-full bg-[var(--ink)] px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save measurement"}
      </button>
      <p className="text-[12.5px] text-[var(--ink-3)]">Fill only what you took — the rest can stay blank.</p>
    </form>
  );
}
