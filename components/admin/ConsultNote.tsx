"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type NoteValues = {
  subjective?: string | null;
  observations?: string | null;
  planOfAction?: string | null;
  nextReviewAt?: string | null;
  sharedWithClient: boolean;
};

const area =
  "w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3 text-[14px] leading-relaxed focus:border-[var(--ink)] focus:outline-none";

export default function ConsultNote({
  appointmentId,
  initial,
  who,
}: {
  appointmentId: string;
  initial?: NoteValues | null;
  who: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<NoteValues>(
    initial ?? { subjective: "", observations: "", planOfAction: "", nextReviewAt: "", sharedWithClient: false }
  );
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const has = Boolean(initial?.subjective || initial?.observations || initial?.planOfAction);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3.5 py-1.5 text-[12.5px] font-semibold hover:border-[var(--ink)]"
      >
        {has ? "View note" : "+ Consultation note"}
      </button>
    );
  }

  return (
    <form
      className="mt-3 grid w-full gap-3 rounded-xl border border-[var(--line)] bg-[var(--tint)] p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true); setError(null); setSaved(false);
        try {
          const res = await fetch(`/api/admin/appointments/${appointmentId}/note`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(v),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) { setError(data?.error ?? "Couldn't save the note."); setBusy(false); return; }
          setSaved(true);
          router.refresh();
        } catch {
          setError("Couldn't reach the server.");
        }
        setBusy(false);
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-semibold">Consultation note · {who}</p>
        <button type="button" onClick={() => setOpen(false)} className="text-[var(--ink-3)]">✕</button>
      </div>

      {([
        ["subjective", "What they told you", "Sleeping better. Struggling with the evening snack. Travelling next week."],
        ["observations", "What you observed", "Weight down 1.2 kg. Waist unchanged. Energy visibly better."],
        ["planOfAction", "Plan of action", "Move dinner to 8pm. Swap evening chana for sprouts. Review in a fortnight."],
      ] as const).map(([k, label, placeholder]) => (
        <label key={k} className="grid gap-1.5">
          <span className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">{label}</span>
          <textarea
            rows={3}
            value={v[k] ?? ""}
            onChange={(e) => setV((p) => ({ ...p, [k]: e.target.value }))}
            placeholder={placeholder}
            className={area}
          />
        </label>
      ))}

      <label className="grid gap-1.5">
        <span className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Next review</span>
        <input
          type="date"
          value={v.nextReviewAt ? String(v.nextReviewAt).slice(0, 10) : ""}
          onChange={(e) => setV((p) => ({ ...p, nextReviewAt: e.target.value }))}
          className="min-h-[38px] w-[190px] rounded-lg border border-[var(--line)] px-3 text-[14px]"
        />
      </label>

      <label className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[var(--ink-2)]">
        <input
          type="checkbox"
          checked={v.sharedWithClient}
          onChange={(e) => setV((p) => ({ ...p, sharedWithClient: e.target.checked }))}
          className="mt-0.5 h-4 w-4 shrink-0"
        />
        <span>
          Share this note with the client. Leave it off for private clinical observations — the
          client sees only what you tick here.
        </span>
      </label>

      {error && <p role="alert" className="text-[13.5px] text-[var(--alert)]">{error}</p>}
      {saved && <p className="text-[13.5px] font-semibold text-[var(--good)]">Saved.</p>}

      <button type="submit" disabled={busy} className="w-fit rounded-full bg-[var(--ink)] px-5 py-2 text-[13.5px] font-semibold text-white disabled:opacity-50">
        {busy ? "Saving…" : "Save note"}
      </button>
    </form>
  );
}
