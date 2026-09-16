"use client";

import { useMemo, useState } from "react";
import { ITEM_TYPES } from "@/lib/plan-types";
import type { PlanEditor } from "./usePlanEditor";
import { TYPE_STYLE, inputCls, type ClientCtx, type LibraryItem } from "./types";

export default function PlanSidebar({
  client, library, templates, editor,
}: {
  client: ClientCtx;
  library: LibraryItem[];
  templates: { id: string; name: string }[];
  editor: PlanEditor;
}) {
  const { plan, day, locked, actions, setMessage } = editor;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return library.slice(0, 24);
    return library.filter((l) => l.name.toLowerCase().includes(q) || l.category.toLowerCase().includes(q)).slice(0, 40);
  }, [library, query]);

  const insert = (l: LibraryItem) => {
    const target = day.slots[day.slots.length - 1];
    if (!target) { setMessage("Add a slot first, then pick from the library."); return; }
    actions.addItem(target.id, { type: l.defaultType, text: l.name, quantity: `1 ${l.servingUnit}`, foodId: l.id });
  };

  const heading = "text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]";
  const card = "rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4";

  return (
    <aside className="grid content-start gap-4" aria-label="Client and library">
      <div className={card}>
        <p className={heading}>Client</p>
        <p className="mt-2 font-[var(--font-display)] text-[18px] font-bold">{client.name}</p>
        <p className="tabular text-[12.5px] text-[var(--ink-3)]">{client.code}</p>
        <dl className="mt-3 grid gap-2 text-[13.5px]">
          {client.goal && <div><dt className="text-[var(--ink-3)]">Goal</dt><dd>{client.goal}</dd></div>}
          {client.foodPreference && <div><dt className="text-[var(--ink-3)]">Preference</dt><dd>{client.foodPreference}</dd></div>}
          {client.conditions.length > 0 && <div><dt className="text-[var(--ink-3)]">Conditions</dt><dd>{client.conditions.join(", ")}</dd></div>}
          {client.allergies.length > 0 && (
            <div><dt className="text-[var(--alert)]">Allergies</dt><dd className="font-semibold text-[var(--alert)]">{client.allergies.join(", ")}</dd></div>
          )}
        </dl>
      </div>

      {client.suggested && (
        <div className={card}>
          <label className="flex items-center gap-2.5 text-[13.5px] font-semibold">
            <input type="checkbox" checked={plan.showTargets} disabled={locked} onChange={(e) => actions.setShowTargets(e.target.checked)} className="h-4 w-4" />
            Show macro targets
          </label>
          <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--ink-3)]">
            Optional. Suggested from height, weight, age and activity —{" "}
            <span className="tabular">{client.suggested.calories} kcal · {client.suggested.protein}g protein</span>.
            Off by default; the plan publishes fine without them.
          </p>
        </div>
      )}

      {!locked && (
        <div className={card}>
          <label htmlFor="plan-library-search" className={heading}>Library</label>
          <input
            id="plan-library-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search foods, supplements, practices…"
            aria-describedby="plan-library-hint"
            className={`${inputCls} mt-2`}
          />
          <div className="mt-2 max-h-[420px] overflow-y-auto">
            {filtered.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => insert(l)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-[var(--tint)]"
              >
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${TYPE_STYLE[l.defaultType]}`}>
                  {ITEM_TYPES.find((t) => t.value === l.defaultType)?.short}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13.5px]">{l.name}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="px-2 py-3 text-[13px] text-[var(--ink-3)]">Nothing matches “{query}”.</p>}
          </div>
          <p id="plan-library-hint" className="mt-2 text-[12px] text-[var(--ink-3)]">Adds to the last slot on this day.</p>
        </div>
      )}

      {templates.length > 0 && (
        <div className={card}>
          <p className={heading}>Your templates</p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--ink-3)]">
            Start a new plan from one of these on the client&rsquo;s page — it copies the whole structure so you edit rather than retype.
          </p>
          <ul className="mt-2 grid gap-1">
            {templates.map((t) => <li key={t.id} className="text-[13px] text-[var(--ink-2)]">· {t.name}</li>)}
          </ul>
        </div>
      )}
    </aside>
  );
}
