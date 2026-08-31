"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WaterTracker({ glasses, target }: { glasses: number; target: number }) {
  const router = useRouter();
  const [n, setN] = useState(glasses);
  const [busy, setBusy] = useState(false);

  const set = async (next: number) => {
    const clamped = Math.max(0, Math.min(30, next));
    const previous = n;
    setN(clamped);
    setBusy(true);
    try {
      const res = await fetch("/api/portal/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "water", glasses: clamped }),
      });
      if (!res.ok) setN(previous);
      else router.refresh();
    } catch {
      setN(previous);
    }
    setBusy(false);
  };

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">Water</p>
        <p className="tabular text-[14px] font-semibold">
          {n} <span className="font-normal text-[var(--ink-3)]">of {target} glasses</span>
        </p>
      </div>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {Array.from({ length: target }).map((_, i) => (
          <button
            key={i}
            onClick={() => set(i + 1 === n ? i : i + 1)}
            disabled={busy}
            aria-label={`${i + 1} glasses`}
            className={`h-9 w-7 rounded-md border transition-colors ${
              i < n ? "border-[#2E8FB0] bg-[#2E8FB0]/25" : "border-[var(--line)] bg-transparent"
            } disabled:opacity-60`}
          />
        ))}
      </div>

      <button
        onClick={() => set(n + 1)}
        disabled={busy}
        className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#2E8FB0] px-5 text-[15px] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
      >
        + Add a glass
      </button>
    </div>
  );
}
