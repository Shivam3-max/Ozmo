"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DAY_NAMES, uid, planWarnings, type PlanDraft, type PlanItemDraft, type PlanSlotDraft } from "@/lib/plan-types";
import type { ClientCtx } from "./types";

export type SaveState = "idle" | "saving" | "saved" | "error";
type Day = PlanDraft["days"][number];

/** The request body for PATCH /api/admin/plans/:id — empty rows are dropped. */
function toPayload(plan: PlanDraft, publish: boolean, expectedUpdatedAt: string) {
  return {
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
            foodId: i.foodId ?? null,
          })),
      })),
    })),
    sections: plan.sections.map((s) => ({ kind: s.kind, title: s.title || null, items: s.items.filter((i) => i.trim()) })),
    publish,
    expectedUpdatedAt,
  };
}

/**
 * All plan-builder state: the draft, saving (queued, autosaved, stale-checked
 * on the server) and the edit operations the components call.
 */
export function usePlanEditor({
  planId, status, updatedAt, initial, client,
}: {
  planId: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  updatedAt: string;
  initial: PlanDraft;
  client: ClientCtx;
}) {
  const router = useRouter();
  const [plan, setPlanState] = useState<PlanDraft>(initial);
  // Published and archived versions are read-only: they may be what the client
  // is following today. Edits happen on a new draft version.
  const [locked, setLocked] = useState(status !== "DRAFT");
  const setPlan = useCallback<typeof setPlanState>((next) => {
    if (!locked) setPlanState(next);
  }, [locked]);
  const lastSavedAt = useRef(updatedAt);
  const saveQueue = useRef<Promise<boolean>>(Promise.resolve(true));
  const [activeDay, setActiveDay] = useState(initial.days[0]?.index ?? 0);
  const [saving, setSaving] = useState<SaveState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const dirty = useRef(false);
  const firstRender = useRef(true);

  const warnings = useMemo(() => planWarnings(plan, client), [plan, client]);
  const blockers = warnings.filter((w) => w.severity === "block");
  const totalItems = plan.days.reduce((n, d) => n + d.slots.reduce((m, s) => m + s.items.length, 0), 0);

  const save = useCallback(
    (publish = false): Promise<boolean> => {
      if (locked) return Promise.resolve(false);
      // Saves run one at a time so each carries the timestamp the previous one returned.
      const run = async (): Promise<boolean> => {
        setSaving("saving");
        try {
          const res = await fetch(`/api/admin/plans/${planId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(toPayload(plan, publish, lastSavedAt.current)),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setSaving("error");
            setMessage(data?.error ?? "Couldn't save.");
            if (data?.code === "NOT_DRAFT") { setLocked(true); router.refresh(); }
            return false;
          }
          if (data.updatedAt) lastSavedAt.current = data.updatedAt;
          setSaving("saved");
          dirty.current = false;
          if (publish) {
            setLocked(true);
            setMessage("Published. The client now sees this version; any earlier version is archived.");
            router.refresh();
          }
          return true;
        } catch {
          setSaving("error");
          setMessage("Couldn't reach the server. Your work is still on screen — try saving again.");
          return false;
        }
      };
      const next = saveQueue.current.then(run, run);
      saveQueue.current = next;
      return next;
    },
    [plan, planId, router, locked]
  );

  // Autosave on a debounce so a long editing session can't be lost to a stray tab close.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (locked) return;
    dirty.current = true;
    setSaving("idle");
    const t = setTimeout(() => void save(false), 1800);
    return () => clearTimeout(t);
  }, [plan, save, locked]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty.current) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const day = plan.days.find((d) => d.index === activeDay) ?? plan.days[0];

  const patchDay = (index: number, fn: (d: Day) => Day) =>
    setPlan((p) => ({ ...p, days: p.days.map((d) => (d.index === index ? fn(d) : d)) }));

  const patchSlot = (slotId: string, fn: (s: PlanSlotDraft) => PlanSlotDraft) =>
    patchDay(day.index, (d) => ({ ...d, slots: d.slots.map((s) => (s.id === slotId ? fn(s) : s)) }));

  const actions = {
    setTitle: (title: string) => setPlan((p) => ({ ...p, title })),

    setDayMode: (mode: PlanDraft["dayMode"], count: number) => {
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
    },

    addEveryDayColumn: () => {
      if (plan.days.some((d) => d.index === -1)) return;
      setPlan((p) => ({ ...p, days: [{ id: uid(), index: -1, label: "Every day", slots: [] }, ...p.days] }));
      setActiveDay(-1);
    },

    copyDayToAll: () => {
      const source = plan.days.find((d) => d.index === activeDay);
      if (!source) return;
      const targets = plan.days.filter((d) => d.index >= 0 && d.index !== source.index).map((d) => d.index);
      setPlan((p) => ({
        ...p,
        days: p.days.map((d) =>
          targets.includes(d.index)
            ? { ...d, slots: source.slots.map((s) => ({ ...s, id: uid(), items: s.items.map((i) => ({ ...i, id: uid() })) })) }
            : d
        ),
      }));
      setMessage(`Copied ${source.label} to ${targets.length} other ${targets.length === 1 ? "day" : "days"}.`);
    },

    addSlot: (label = "") =>
      patchDay(day.index, (d) => ({ ...d, slots: [...d.slots, { id: uid(), label: label || "New slot", items: [] }] })),

    removeSlot: (slotId: string) => patchDay(day.index, (d) => ({ ...d, slots: d.slots.filter((s) => s.id !== slotId) })),

    patchSlot,

    toggleOptionGroup: (slotId: string) =>
      patchSlot(slotId, (s) => {
        const on = s.items.some((i) => i.optionGroup != null);
        return { ...s, optionNote: on ? undefined : "Any 1 from the given options", items: s.items.map((i) => ({ ...i, optionGroup: on ? null : 1 })) };
      }),

    addItem: (slotId: string, partial: Partial<PlanItemDraft> = {}) =>
      patchSlot(slotId, (s) => ({ ...s, items: [...s.items, { id: uid(), type: "FOOD", text: "", ...partial }] })),

    patchItem: (slotId: string, itemId: string, change: Partial<PlanItemDraft>) =>
      patchSlot(slotId, (s) => ({ ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, ...change } : i)) })),

    removeItem: (slotId: string, itemId: string) =>
      patchSlot(slotId, (s) => ({ ...s, items: s.items.filter((i) => i.id !== itemId) })),

    setSection: (kind: "GUIDELINES" | "NOTES", text: string) =>
      setPlan((p) => {
        const existing = p.sections.find((s) => s.kind === kind);
        const rest = p.sections.filter((s) => s.kind !== kind);
        return {
          ...p,
          sections: [...rest, { id: existing?.id ?? uid(), kind, title: kind === "GUIDELINES" ? "Guidelines" : "Notes", items: text.split("\n") }],
        };
      }),

    setShowTargets: (on: boolean) =>
      setPlan((p) => ({
        ...p,
        showTargets: on,
        targetCalories: on ? p.targetCalories ?? client.suggested?.calories : p.targetCalories,
        targetProtein: on ? p.targetProtein ?? client.suggested?.protein : p.targetProtein,
      })),
  };

  return {
    plan, day, activeDay, setActiveDay, locked, saving, message, setMessage,
    warnings, blockers, totalItems, save, actions,
  };
}

export type PlanEditor = ReturnType<typeof usePlanEditor>;
