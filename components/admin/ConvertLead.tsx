"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ConvertLead({
  leadId,
  programs,
  suggested,
}: {
  leadId: string;
  programs: { slug: string; name: string; durations: number[] }[];
  suggested?: string | null;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(suggested ?? programs[0]?.slug ?? "");
  const [months, setMonths] = useState(3);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const program = programs.find((p) => p.slug === slug);
  const durations = program?.durations?.length ? program.durations : [1, 3, 6];

  return (
    <form
      className="grid gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        setError(null);
        try {
          const res = await fetch(`/api/admin/leads/${leadId}/convert`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ programSlug: slug, durationMonths: months }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setError(data?.error ?? "Couldn't convert this lead.");
            setBusy(false);
            return;
          }
          router.push(`/admin/clients/${data.clientId}`);
        } catch {
          setError("Couldn't reach the server.");
          setBusy(false);
        }
      }}
    >
      <label className="grid gap-1.5">
        <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Programme</span>
        <select value={slug} onChange={(e) => setSlug(e.target.value)} className="min-h-[42px] rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 text-[14.5px]">
          {programs.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
      </label>

      <label className="grid gap-1.5">
        <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Duration</span>
        <div className="flex gap-2">
          {durations.map((d) => (
            <button
              type="button"
              key={d}
              onClick={() => setMonths(d)}
              className={`tabular flex-1 rounded-lg border px-3 py-2 text-[14px] font-semibold ${
                months === d ? "border-[var(--ink)] bg-[var(--accent)]/15" : "border-[var(--line)] text-[var(--ink-2)]"
              }`}
            >
              {d} mo
            </button>
          ))}
        </div>
      </label>

      {error && <p role="alert" className="text-[13.5px] text-[var(--alert)]">{error}</p>}

      <button
        type="submit"
        disabled={busy || !slug}
        className="mt-1 inline-flex min-h-[42px] items-center justify-center rounded-full bg-[var(--good)] px-5 text-[14.5px] font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Creating client…" : "Convert to client"}
      </button>
      <p className="text-[12.5px] leading-relaxed text-[var(--ink-3)]">
        Creates the client account, the enrollment, a health record from their assessment and a
        starting weight — then opens their file.
      </p>
    </form>
  );
}
