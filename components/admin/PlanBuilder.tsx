"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ITEM_TYPES, SLOT_SUGGESTIONS, DAY_NAMES, uid, planWarnings,
  type ItemType, type PlanDraft, type PlanItemDraft, type PlanSlotDraft,
} from "@/lib/plan-types";

type LibraryItem = { id: string; name: string; category: string; servingUnit: string; defaultType: ItemType };
type ClientCtx = {
  id: string; name: string; code: string;
  goal?: string | null; conditions: string[];
  allergies: string[]; dislikes: string[]; foodPreference?: string | null;
  suggested?: { calories: number; protein: number; carbs: number; fat: number } | null;
};

const TYPE_STYLE: Record<ItemType, string> = {
  FOOD: "bg-[var(--tint)] text-[var(--ink-2)]",
  SUPPLEMENT: "bg-[var(--accent)]/25 text-[var(--accent-text)]",
  EXERCISE: "bg-[var(--good)]/12 text-[var(--good)]",
  BREATHWORK: "bg-[#5A8FA8]/14 text-[#3D6E86]",
  LIFESTYLE: "bg-[#7A6FA8]/14 text-[#5C5185]",
  HYDRATION: "bg-[#2E8FB0]/12 text-[#226F8A]",
  PREP: "bg-[var(--watch)]/12 text-[var(--watch)]",
  NOTE: "bg-[var(--line-soft)] text-[var(--ink-3)]",
};

const inputCls =
  "min-h-[38px] w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 text-[14px] focus:border-[var(--ink)] focus:outline-none";

export default function PlanBuilder({
  planId, initial, client, library, templates,
}: {
  planId: string;
  initial: PlanDraft;
  client: ClientCtx;
  library: LibraryItem[];
  templates: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanDraft>(initial);
  const [activeDay, setActiveDay] = useState(initial.days[0]?.index ?? 0);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const dirty = useRef(false);
  const firstRender = useRef(true);

  const warnings = useMemo(() => planWarnings(plan, client), [plan, client]);
  const blockers = warnings.filter((w) => w.severity === "block");

  const totalItems = plan.days.reduce(
    (n, d) => n + d.slots.reduce((m, s) => m + s.items.length, 0), 0
  );

  /* ── saving ───────────────────────────────────────────────────────────── */
  const save = useCallback(
    async (publish = false) => {
      setSaving("saving");
      try {
        const res = await fetch(`/api/admin/plans/${planId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...plan,
            days: plan.days.map((d) => ({
              index: d.index,
              label: d.label,
              slots: d.slots.map((s) => ({
                label: s.label,
                timeHint: s.timeHint || null,
                condition: s.condition || null,
                optionNote: s.optionNote || null,
                items: s.items
                  .filter((i) => i.text.trim())
                  .map((i) => ({
                    type: i.type,
                    text: i.text,
                    quantity: i.quantity || null,
                    prepNote: i.prepNote || null,
                    optionGroup: i.optionGroup ?? null,
                  })),
              })),
            })),
            sections: plan.sections.map((s) => ({
              kind: s.kind,
              title: s.title || null,
              items: s.items.filter((i) => i.trim()),
            })),
            publish,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setSaving("error");
          setMessage(data?.error ?? "Couldn't save.");
          return false;
        }
        setSaving("saved");
        dirty.current = false;
        if (publish) {
          setMessage("Published. The client's previous plan has been archived.");
          router.refresh();
        }
        return true;
      } catch {
        setSaving("error");
        setMessage("Couldn't reach the server. Your work is still on screen — try saving again.");
        return false;
      }
    },
    [plan, planId, router]
  );

  // Autosave on a debounce so a long editing session can't be lost to a stray tab close.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    dirty.current = true;
    setSaving("idle");
    const t = setTimeout(() => void save(false), 1800);
    return () => clearTimeout(t);
  }, [plan, save]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty.current) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  /* ── day helpers ──────────────────────────────────────────────────────── */
  const day = plan.days.find((d) => d.index === activeDay) ?? plan.days[0];

  const patchDay = (index: number, fn: (d: PlanDraft["days"][number]) => PlanDraft["days"][number]) =>
    setPlan((p) => ({ ...p, days: p.days.map((d) => (d.index === index ? fn(d) : d)) }));

  const patchSlot = (slotId: string, fn: (s: PlanSlotDraft) => PlanSlotDraft) =>
    patchDay(day.index, (d) => ({ ...d, slots: d.slots.map((s) => (s.id === slotId ? fn(s) : s)) }));

  const setDayMode = (mode: PlanDraft["dayMode"], count: number) => {
    setPlan((p) => {
      const keep = new Map(p.days.map((d) => [d.index, d]));
      const days: PlanDraft["days"] = [];
      if (mode !== "SINGLE" && keep.has(-1)) days.push(keep.get(-1)!);
      if (mode === "SINGLE") {
        days.push(keep.get(0) ?? keep.get(-1) ?? { id: uid(), index: 0, label: "Every day", slots: [] });
        days[days.length - 1] = { ...days[days.length - 1], index: 0, label: "Every day" };
      } else {
        for (let i = 0; i < count; i++) {
          const label = mode === "WEEK" ? DAY_NAMES[i] ?? `Day ${i + 1}` : `Day ${i + 1}`;
          days.push(keep.get(i) ? { ...keep.get(i)!, label } : { id: uid(), index: i, label, slots: [] });
        }
      }
      return { ...p, dayMode: mode, dayCount: mode === "SINGLE" ? 1 : count, days };
    });
    setActiveDay(mode === "SINGLE" ? 0 : activeDay === -1 ? -1 : 0);
  };

  const addEveryDayColumn = () => {
    if (plan.days.some((d) => d.index === -1)) return;
    setPlan((p) => ({ ...p, days: [{ id: uid(), index: -1, label: "Every day", slots: [] }, ...p.days] }));
    setActiveDay(-1);
  };

  const copyDayTo = (targets: number[]) => {
    const source = plan.days.find((d) => d.index === activeDay);
    if (!source) return;
    setPlan((p) => ({
      ...p,
      days: p.days.map((d) =>
        targets.includes(d.index) && d.index !== source.index
          ? {
              ...d,
              slots: source.slots.map((s) => ({
                ...s, id: uid(),
                items: s.items.map((i) => ({ ...i, id: uid() })),
              })),
            }
          : d
      ),
    }));
    setMessage(`Copied ${source.label} to ${targets.length} other ${targets.length === 1 ? "day" : "days"}.`);
  };

  /* ── slot & item helpers ──────────────────────────────────────────────── */
  const addSlot = (label = "") =>
    patchDay(day.index, (d) => ({
      ...d,
      slots: [...d.slots, { id: uid(), label: label || "New slot", items: [] }],
    }));

  const addItem = (slotId: string, partial: Partial<PlanItemDraft> = {}) =>
    patchSlot(slotId, (s) => ({
      ...s,
      items: [...s.items, { id: uid(), type: "FOOD", text: "", ...partial }],
    }));

  const toggleOptionGroup = (slotId: string) =>
    patchSlot(slotId, (s) => {
      const on = s.items.some((i) => i.optionGroup != null);
      return {
        ...s,
        optionNote: on ? undefined : "Any 1 from the given options",
        items: s.items.map((i) => ({ ...i, optionGroup: on ? null : 1 })),
      };
    });

  const filteredLibrary = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return library.slice(0, 24);
    return library.filter((l) => l.name.toLowerCase().includes(q) || l.category.toLowerCase().includes(q)).slice(0, 40);
  }, [library, query]);

  const insertFromLibrary = (l: LibraryItem) => {
    const target = day.slots[day.slots.length - 1];
    if (!target) { setMessage("Add a slot first, then pick from the library."); return; }
    addItem(target.id, { type: l.defaultType, text: l.name, quantity: `1 ${l.servingUnit}` });
  };

  /* ── render ───────────────────────────────────────────────────────────── */
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
      <div className="min-w-0">
        {/* header */}
        <div className="mb-5 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-5">
          <input
            value={plan.title}
            onChange={(e) => setPlan((p) => ({ ...p, title: e.target.value }))}
            placeholder="15 Days Vegetarian Diabetes & Fatty Liver Plan"
            className="w-full border-0 bg-transparent p-0 font-[var(--font-display)] text-[24px] font-bold tracking-[-0.02em] focus:outline-none"
          />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {(["SINGLE", "WEEK", "SEQUENCE"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setDayMode(m, m === "WEEK" ? 7 : m === "SEQUENCE" ? Math.max(plan.dayCount, 7) : 1)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                  plan.dayMode === m ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--ink)]"
                }`}
              >
                {m === "SINGLE" ? "One day" : m === "WEEK" ? "Week" : "Day sequence"}
              </button>
            ))}
            {plan.dayMode === "SEQUENCE" && (
              <label className="flex items-center gap-2 text-[13px] text-[var(--ink-2)]">
                <input
                  type="number" min={2} max={90} value={plan.dayCount}
                  onChange={(e) => setDayMode("SEQUENCE", Math.max(2, Math.min(90, Number(e.target.value) || 2)))}
                  className="tabular h-[34px] w-[70px] rounded-lg border border-[var(--line)] px-2 text-[13.5px]"
                />
                days
              </label>
            )}
            {!plan.days.some((d) => d.index === -1) && plan.dayMode !== "SINGLE" && (
              <button onClick={addEveryDayColumn} className="rounded-full border border-dashed border-[var(--line)] px-3.5 py-1.5 text-[13px] text-[var(--ink-2)] hover:border-[var(--ink)]">
                + Every-day rows
              </button>
            )}

            <div className="ml-auto flex items-center gap-3">
              <span className="text-[12.5px] text-[var(--ink-3)]">
                {saving === "saving" ? "Saving…" : saving === "saved" ? "Saved" : saving === "error" ? "Not saved" : `${totalItems} items`}
              </span>
              <button
                onClick={() => void save(false)}
                className="rounded-full border border-[var(--line)] px-4 py-2 text-[13.5px] font-semibold hover:border-[var(--ink)]"
              >
                Save draft
              </button>
              <button
                onClick={async () => {
                  if (blockers.length) { setMessage("Resolve the blocking warnings before publishing."); return; }
                  setPublishing(true);
                  await save(true);
                  setPublishing(false);
                }}
                disabled={publishing || totalItems === 0}
                className="rounded-full bg-[var(--ink)] px-4 py-2 text-[13.5px] font-semibold text-white disabled:opacity-40"
              >
                {publishing ? "Publishing…" : "Publish to client"}
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--tint)] px-4 py-3 text-[14px]">
            <span className="flex-1">{message}</span>
            <button onClick={() => setMessage(null)} className="text-[var(--ink-3)]">✕</button>
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
          </div>
        )}

        {/* day tabs */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {plan.days.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveDay(d.index)}
              className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors ${
                d.index === activeDay
                  ? "bg-[var(--accent)] text-[#0F2E3D]"
                  : "border border-[var(--line)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)]"
              }`}
            >
              {d.label}
              {d.slots.length > 0 && <span className="tabular ml-1.5 opacity-55">{d.slots.length}</span>}
            </button>
          ))}
          {plan.days.length > 1 && (
            <button
              onClick={() => copyDayTo(plan.days.filter((d) => d.index >= 0).map((d) => d.index))}
              className="ml-auto rounded-full border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2 text-[13px] font-semibold text-[var(--ink-2)] hover:border-[var(--ink)]"
            >
              Copy {day.label} to all days
            </button>
          )}
        </div>

        {/* slots */}
        <div className="grid gap-3">
          {day.slots.map((slot, si) => {
            const grouped = slot.items.some((i) => i.optionGroup != null);
            return (
              <div key={slot.id} className="rounded-xl border border-[var(--line)] bg-[var(--paper)]">
                <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] px-4 py-3">
                  <input
                    value={slot.label}
                    onChange={(e) => patchSlot(slot.id, (s) => ({ ...s, label: e.target.value }))}
                    list="slot-suggestions"
                    className="min-w-[150px] flex-1 border-0 bg-transparent p-0 text-[16px] font-semibold focus:outline-none"
                  />
                  <input
                    value={slot.timeHint ?? ""}
                    onChange={(e) => patchSlot(slot.id, (s) => ({ ...s, timeHint: e.target.value }))}
                    placeholder="time e.g. 10 am"
                    className="tabular h-[32px] w-[112px] rounded-lg border border-[var(--line)] px-2.5 text-[13px]"
                  />
                  <input
                    value={slot.condition ?? ""}
                    onChange={(e) => patchSlot(slot.id, (s) => ({ ...s, condition: e.target.value }))}
                    placeholder="only if… e.g. leg day"
                    className="h-[32px] w-[140px] rounded-lg border border-[var(--line)] px-2.5 text-[13px]"
                  />
                  <button
                    onClick={() => toggleOptionGroup(slot.id)}
                    className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold ${grouped ? "bg-[var(--accent)] text-[#0F2E3D]" : "border border-[var(--line)] text-[var(--ink-2)]"}`}
                    title="Mark these items as interchangeable options"
                  >
                    {grouped ? "Options" : "Make options"}
                  </button>
                  <button
                    onClick={() => patchDay(day.index, (d) => ({ ...d, slots: d.slots.filter((s) => s.id !== slot.id) }))}
                    className="px-1.5 text-[var(--ink-3)] hover:text-[var(--alert)]"
                    aria-label="Remove slot"
                  >
                    ✕
                  </button>
                </div>

                {grouped && (
                  <p className="border-b border-[var(--line-soft)] bg-[var(--accent)]/8 px-4 py-2 text-[13px] font-semibold text-[var(--accent-text)]">
                    {slot.optionNote ?? "Any 1 from the given options"}
                  </p>
                )}

                <div className="grid gap-1.5 p-3">
                  {slot.items.map((item, ii) => (
                    <div key={item.id} className="flex flex-wrap items-start gap-2 rounded-lg px-1 py-1 hover:bg-[var(--tint)]">
                      {grouped && (
                        <span className="tabular mt-2 w-5 shrink-0 text-[13px] font-bold text-[var(--accent-text)]">{ii + 1}</span>
                      )}
                      <select
                        value={item.type}
                        onChange={(e) =>
                          patchSlot(slot.id, (s) => ({
                            ...s, items: s.items.map((i) => (i.id === item.id ? { ...i, type: e.target.value as ItemType } : i)),
                          }))
                        }
                        className={`h-[36px] shrink-0 rounded-lg border-0 px-2 text-[12px] font-bold ${TYPE_STYLE[item.type]}`}
                      >
                        {ITEM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.short}</option>)}
                      </select>
                      <textarea
                        rows={1}
                        value={item.text}
                        onChange={(e) =>
                          patchSlot(slot.id, (s) => ({
                            ...s, items: s.items.map((i) => (i.id === item.id ? { ...i, text: e.target.value } : i)),
                          }))
                        }
                        placeholder="Grated gheeya + missi roti ×2 with whisked curd (jeera, pudhina, dry ginger)"
                        className="min-h-[36px] min-w-[200px] flex-1 resize-y rounded-lg border border-[var(--line)] px-3 py-2 text-[14px] leading-snug focus:border-[var(--ink)] focus:outline-none"
                      />
                      <input
                        value={item.quantity ?? ""}
                        onChange={(e) =>
                          patchSlot(slot.id, (s) => ({
                            ...s, items: s.items.map((i) => (i.id === item.id ? { ...i, quantity: e.target.value } : i)),
                          }))
                        }
                        placeholder="1 katori"
                        className="h-[36px] w-[110px] shrink-0 rounded-lg border border-[var(--line)] px-2.5 text-[13px]"
                      />
                      <button
                        onClick={() => patchSlot(slot.id, (s) => ({ ...s, items: s.items.filter((i) => i.id !== item.id) }))}
                        className="mt-1 px-1.5 text-[var(--ink-3)] hover:text-[var(--alert)]"
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addItem(slot.id)}
                    className="mt-1 w-fit rounded-lg px-2 py-1.5 text-[13.5px] font-semibold text-[var(--accent-text)] hover:bg-[var(--tint)]"
                  >
                    + Add {grouped ? "option" : "item"}
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap gap-2 rounded-xl border border-dashed border-[var(--line)] p-4">
            <button onClick={() => addSlot()} className="rounded-full bg-[var(--ink)] px-4 py-2 text-[13.5px] font-semibold text-white">
              + Add slot
            </button>
            {SLOT_SUGGESTIONS.filter((l) => !day.slots.some((s) => s.label === l)).slice(0, 8).map((l) => (
              <button key={l} onClick={() => addSlot(l)} className="rounded-full border border-[var(--line)] px-3.5 py-2 text-[13px] text-[var(--ink-2)] hover:border-[var(--ink)]">
                + {l}
              </button>
            ))}
          </div>
        </div>

        {/* guidelines & notes */}
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {(["GUIDELINES", "NOTES"] as const).map((kind) => {
            const section = plan.sections.find((s) => s.kind === kind);
            return (
              <div key={kind} className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4">
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">
                  {kind === "GUIDELINES" ? "Guidelines" : "Notes"}
                </p>
                <textarea
                  rows={6}
                  value={(section?.items ?? []).join("\n")}
                  onChange={(e) => {
                    const items = e.target.value.split("\n");
                    setPlan((p) => {
                      const rest = p.sections.filter((s) => s.kind !== kind);
                      return { ...p, sections: [...rest, { id: section?.id ?? uid(), kind, title: kind === "GUIDELINES" ? "Guidelines" : "Notes", items }] };
                    });
                  }}
                  placeholder={kind === "GUIDELINES" ? "Walk 20 mins after meals\nSleep before 10:30 pm\nAvoid sugar, fried food, bakery" : "Always add a pinch of dry ginger, jeera and kali mirch"}
                  className="mt-2 w-full rounded-lg border border-[var(--line)] p-3 text-[14px] leading-relaxed focus:border-[var(--ink)] focus:outline-none"
                />
                <p className="mt-1.5 text-[12px] text-[var(--ink-3)]">One line per point.</p>
              </div>
            );
          })}
        </div>

        <datalist id="slot-suggestions">
          {SLOT_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
        </datalist>
      </div>

      {/* right rail */}
      <aside className="grid content-start gap-4">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4">
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">Client</p>
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
          <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4">
            <label className="flex items-center gap-2.5 text-[13.5px] font-semibold">
              <input
                type="checkbox"
                checked={plan.showTargets}
                onChange={(e) => setPlan((p) => ({
                  ...p,
                  showTargets: e.target.checked,
                  targetCalories: e.target.checked ? p.targetCalories ?? client.suggested!.calories : p.targetCalories,
                  targetProtein: e.target.checked ? p.targetProtein ?? client.suggested!.protein : p.targetProtein,
                }))}
                className="h-4 w-4"
              />
              Show macro targets
            </label>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--ink-3)]">
              Optional. Suggested from height, weight, age and activity —{" "}
              <span className="tabular">{client.suggested.calories} kcal · {client.suggested.protein}g protein</span>.
              Off by default; the plan publishes fine without them.
            </p>
          </div>
        )}

        <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4">
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">Library</p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search foods, supplements, practices…"
            className={`${inputCls} mt-2`}
          />
          <div className="mt-2 max-h-[420px] overflow-y-auto">
            {filteredLibrary.map((l) => (
              <button
                key={l.id}
                onClick={() => insertFromLibrary(l)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-[var(--tint)]"
              >
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${TYPE_STYLE[l.defaultType]}`}>
                  {ITEM_TYPES.find((t) => t.value === l.defaultType)?.short}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13.5px]">{l.name}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-[var(--ink-3)]">Adds to the last slot on this day.</p>
        </div>

        {templates.length > 0 && (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4">
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">Your templates</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--ink-3)]">
              Start a new plan from one of these on the client&rsquo;s page — it copies the whole
              structure so you edit rather than retype.
            </p>
            <ul className="mt-2 grid gap-1">
              {templates.map((t) => <li key={t.id} className="text-[13px] text-[var(--ink-2)]">· {t.name}</li>)}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
