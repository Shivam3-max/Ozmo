"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RecordWeight({ lastWeight }: { lastWeight: number | null }) {
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  /** Never a disappointed message. This is where people quit. */
  const feedback = (value: number) => {
    if (lastWeight === null) return `${value} kg recorded. That's your starting point.`;
    const diff = Math.round((value - lastWeight) * 10) / 10;
    if (diff < 0) return `${value} kg — that's ${Math.abs(diff)} kg down from last time. Steady progress.`;
    if (diff === 0) return `${value} kg — same as last time. Weight often holds for a week or two while other things are still changing.`;
    return `${value} kg — up ${diff} kg. One reading doesn't mean much; weight moves with water, salt and cycle. Let's look at the trend.`;
  };

  return (
    <form
      className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true); setError(null); setMessage(null);
        try {
          const res = await fetch("/api/portal/measurements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ weightKg: weight, waistCm: waist, hipCm: hip }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) { setError(data?.error ?? "Couldn't save that."); setBusy(false); return; }
          if (weight) setMessage(feedback(Number(weight)));
          else setMessage("Recorded.");
          setWeight(""); setWaist(""); setHip("");
          router.refresh();
        } catch {
          setError("Couldn't reach the server. Try again in a moment.");
        }
        setBusy(false);
      }}
    >
      <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">Record today</p>

      <div className="mt-3.5 grid grid-cols-3 gap-2.5">
        {([["Weight", "kg", weight, setWeight], ["Waist", "cm", waist, setWaist], ["Hip", "cm", hip, setHip]] as const).map(
          ([label, unit, value, setter]) => (
            <label key={label} className="grid gap-1.5">
              <span className="text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--ink-3)]">
                {label} <span className="font-normal normal-case">{unit}</span>
              </span>
              <input
                type="number" step="0.1" min={0} inputMode="decimal"
                value={value} onChange={(e) => setter(e.target.value)}
                className="tabular min-h-[48px] rounded-xl border border-[var(--line)] px-3 text-[17px]"
              />
            </label>
          )
        )}
      </div>

      {error && <p role="alert" className="mt-3 text-[13.5px] text-[var(--alert)]">{error}</p>}
      {message && (
        <p className="mt-3 rounded-xl bg-[var(--tint)] px-4 py-3 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[var(--ink)] px-6 text-[15.5px] font-semibold text-white disabled:opacity-50 sm:w-auto"
      >
        {busy ? "Saving…" : "Save"}
      </button>
      <p className="mt-2.5 text-[13px] text-[var(--ink-3)]">
        Weigh at the same time of day, after the toilet, before eating. Fill only what you took.
      </p>
    </form>
  );
}
