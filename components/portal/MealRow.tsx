"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export type SlotItem = {
  id: string;
  type: string;
  text: string;
  quantity: string | null;
  optionGroup: number | null;
};

export type Slot = {
  id: string;
  label: string;
  timeHint: string | null;
  condition: string | null;
  optionNote: string | null;
  items: SlotItem[];
};

const TYPE_LABEL: Record<string, string> = {
  SUPPLEMENT: "Supplement",
  EXERCISE: "Movement",
  BREATHWORK: "Breathing",
  LIFESTYLE: "Practice",
  HYDRATION: "Fluids",
  PREP: "Prepare",
  NOTE: "Note",
};

export default function MealRow({
  slot,
  logged,
  source,
}: {
  slot: Slot;
  logged: boolean;
  source?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [on, setOn] = useState(logged);
  const [showOther, setShowOther] = useState(false);
  const [other, setOther] = useState("");
  const [error, setError] = useState(false);

  const options = slot.items.filter((i) => i.optionGroup != null);
  const plain = slot.items.filter((i) => i.optionGroup == null);

  const send = async (body: Record<string, unknown>, optimistic: boolean) => {
    setOn(optimistic);
    setError(false);
    try {
      const res = await fetch("/api/portal/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { setOn(!optimistic); setError(true); return; }
      startTransition(() => router.refresh());
    } catch {
      setOn(!optimistic);
      setError(true);
    }
  };

  return (
    <div className={`rounded-2xl border bg-[var(--paper)] transition-colors ${on ? "border-[var(--good)]/40" : "border-[var(--line)]"}`}>
      <div className="flex flex-wrap items-baseline gap-2 border-b border-[var(--line-soft)] px-5 py-3">
        <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">{slot.label}</span>
        {slot.timeHint && <span className="tabular text-[13px] text-[var(--ink-3)]">{slot.timeHint}</span>}
        {slot.condition && (
          <span className="rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#0F2E3D]">
            {slot.condition}
          </span>
        )}
        {on && (
          <span className="ml-auto text-[12.5px] font-semibold text-[var(--good)]">
            {source === "OFF_PLAN" ? "Logged — something else" : source === "SWAPPED" ? "Swapped" : "Done"}
          </span>
        )}
      </div>

      <div className="px-5 py-4">
        {plain.length > 0 && (
          <ul className="grid gap-1.5">
            {plain.map((i) => (
              <li key={i.id} className="flex gap-2.5 text-[15px] leading-relaxed">
                <span aria-hidden className="text-[var(--ink-3)]">–</span>
                <span>
                  {i.type !== "FOOD" && (
                    <span className="mr-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--accent-text)]">
                      {TYPE_LABEL[i.type]}
                    </span>
                  )}
                  {i.text}
                  {i.quantity && <span className="text-[var(--ink-2)]"> — {i.quantity}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}

        {options.length > 0 && (
          <div className={plain.length ? "mt-3 border-l-2 border-[var(--line)] pl-4" : "border-l-2 border-[var(--line)] pl-4"}>
            <p className="text-[12.5px] font-bold italic text-[var(--accent-text)]">
              {slot.optionNote ?? "Any 1 of these"}
            </p>
            <ol className="mt-1.5 grid gap-1.5">
              {options.map((i, n) => (
                <li key={i.id} className="flex gap-2.5 text-[15px] leading-relaxed">
                  <span className="tabular shrink-0 font-semibold text-[var(--ink-3)]">{n + 1}.</span>
                  <span>
                    {i.text}
                    {i.quantity && <span className="text-[var(--ink-2)]"> — {i.quantity}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {on ? (
            <button
              onClick={() => send({ action: "unmeal", slotLabel: slot.label }, false)}
              disabled={pending}
              className="rounded-full border border-[var(--line)] px-4 py-2.5 text-[14px] font-medium text-[var(--ink-2)] disabled:opacity-50"
            >
              Undo
            </button>
          ) : (
            <>
              <button
                onClick={() => send({ action: "meal", slotLabel: slot.label, source: "FROM_PLAN" }, true)}
                disabled={pending}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--accent)] px-5 text-[15px] font-semibold text-[#0F2E3D] transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Had this
              </button>
              <button
                onClick={() => setShowOther(!showOther)}
                disabled={pending}
                className="min-h-[44px] rounded-full border border-[var(--line)] px-4 text-[14px] font-medium text-[var(--ink-2)] disabled:opacity-50"
              >
                I ate something else
              </button>
            </>
          )}
        </div>

        {showOther && !on && (
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              value={other}
              onChange={(e) => setOther(e.target.value)}
              placeholder="What did you have?"
              className="min-h-[44px] min-w-[200px] flex-1 rounded-xl border border-[var(--line)] px-4 text-[15px]"
            />
            <button
              onClick={() => {
                send({ action: "meal", slotLabel: slot.label, source: "OFF_PLAN", customText: other }, true);
                setShowOther(false);
                setOther("");
              }}
              className="min-h-[44px] rounded-full bg-[var(--ink)] px-5 text-[14.5px] font-semibold text-white"
            >
              Log it
            </button>
          </div>
        )}

        {showOther && !on && (
          <p className="mt-2 text-[13px] text-[var(--ink-3)]">
            Not a problem — your dietitian sees this so the plan can be adjusted.
          </p>
        )}

        {error && <p role="alert" className="mt-2 text-[13px] text-[var(--alert)]">Couldn&rsquo;t save that. Try again.</p>}
      </div>
    </div>
  );
}
