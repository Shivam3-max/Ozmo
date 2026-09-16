import { z } from "zod";
import { ITEM_TYPE_VALUES } from "@/lib/food-schema";

/**
 * Validation and change detection for the plan builder. Pure functions — no
 * database — so they're unit-tested directly (lib/services/plan-diff.test.ts).
 */

const itemSchema = z.object({
  type: z.enum(ITEM_TYPE_VALUES),
  text: z.string().trim().min(1, "is empty").max(2000, "is longer than 2000 characters"),
  quantity: z.string().trim().max(200, "quantity is too long").nullish(),
  prepNote: z.string().trim().max(500, "prep note is too long").nullish(),
  optionGroup: z.number().int().nullish(),
  foodId: z.string().max(40).nullish(),
});

const slotSchema = z.object({
  label: z.string().trim().min(1, "needs a name").max(160, "name is too long"),
  timeHint: z.string().trim().max(80, "time is too long").nullish(),
  condition: z.string().trim().max(160, "condition is too long").nullish(),
  optionNote: z.string().trim().max(200, "option note is too long").nullish(),
  items: z.array(itemSchema).max(60, "has more than 60 rows"),
});

export const planSaveSchema = z.object({
  title: z.string().trim().min(1, "The plan needs a title.").max(200, "The title is too long."),
  dayMode: z.enum(["SINGLE", "WEEK", "SEQUENCE"]),
  dayCount: z.number().int().min(1).max(90),
  dietPreference: z.string().trim().max(80).nullish(),
  conditionsNote: z.string().trim().max(300).nullish(),
  showTargets: z.boolean(),
  targetCalories: z.number().int().min(0).max(6000).nullish(),
  targetProtein: z.number().int().min(0).max(400).nullish(),
  targetCarbs: z.number().int().min(0).max(900).nullish(),
  targetFat: z.number().int().min(0).max(400).nullish(),
  days: z
    .array(z.object({
      index: z.number().int().min(-1).max(90),
      label: z.string().trim().min(1, "needs a name").max(80, "name is too long"),
      slots: z.array(slotSchema).max(40, "has more than 40 meal slots"),
    }))
    .max(91)
    .refine((days) => new Set(days.map((d) => d.index)).size === days.length, "Two days in the plan have the same position."),
  sections: z
    .array(z.object({
      kind: z.enum(["GUIDELINES", "NOTES"]),
      title: z.string().trim().max(160).nullish(),
      items: z.array(z.string().trim().max(600, "a line is longer than 600 characters")).max(40, "has more than 40 lines"),
    }))
    .max(6),
  publish: z.boolean().optional(),
  /** The updatedAt the editor last saw; a mismatch means another tab or person saved since. */
  expectedUpdatedAt: z.string().min(1),
});

export type PlanSave = z.infer<typeof planSaveSchema>;
export type DayInput = PlanSave["days"][number];

/**
 * Turns a validation issue into something the dietitian can find:
 * "Tuesday → Breakfast → row 2 is longer than 2000 characters".
 */
export function describePlanIssue(issue: z.core.$ZodIssue, payload: unknown): string {
  const path = issue.path;
  const body = (payload ?? {}) as { days?: { label?: string; slots?: { label?: string }[] }[]; sections?: { kind?: string }[] };
  const parts: string[] = [];
  if (path[0] === "days" && typeof path[1] === "number") {
    const day = body.days?.[path[1]];
    parts.push(day?.label || `Day ${path[1] + 1}`);
    if (path[2] === "slots" && typeof path[3] === "number") {
      const slot = day?.slots?.[path[3]];
      parts.push(slot?.label || `slot ${path[3] + 1}`);
      if (path[4] === "items" && typeof path[5] === "number") parts.push(`row ${path[5] + 1}`);
    }
  } else if (path[0] === "sections" && typeof path[1] === "number") {
    parts.push(body.sections?.[path[1]]?.kind === "NOTES" ? "Notes" : "Guidelines");
  }
  if (parts.length === 0) return issue.message.endsWith(".") ? issue.message : `${issue.message}.`;
  return `${parts.join(" → ")} ${issue.message}.`;
}

type StoredItem = { type: string; text: string; quantity: string | null; prepNote: string | null; optionGroup: number | null; foodId: string | null };
type StoredDay = { index: number; label: string; slots: { label: string; timeHint: string | null; condition: string | null; optionNote: string | null; items: StoredItem[] }[] };

/** A day's content in a stable form, so identical content compares equal regardless of row ids or nulls vs undefined. */
export function canonicalDay(day: DayInput | StoredDay) {
  return JSON.stringify({
    label: day.label.trim(),
    slots: day.slots.map((s) => ({
      label: s.label.trim(),
      timeHint: s.timeHint || null,
      condition: s.condition || null,
      optionNote: s.optionNote || null,
      items: s.items.map((i) => ({
        type: i.type, text: i.text.trim(), quantity: i.quantity || null, prepNote: i.prepNote || null,
        optionGroup: i.optionGroup ?? null, foodId: i.foodId ?? null,
      })),
    })),
  });
}

/**
 * Which days an autosave actually has to write. Editing one meal on Tuesday
 * rewrites Tuesday only, instead of every row of every day on each keystroke pause.
 */
export function diffDays(existing: StoredDay[], incoming: DayInput[]) {
  const before = new Map(existing.map((d) => [d.index, canonicalDay(d)]));
  const after = new Set(incoming.map((d) => d.index));
  return {
    create: incoming.filter((d) => !before.has(d.index)),
    replace: incoming.filter((d) => before.has(d.index) && before.get(d.index) !== canonicalDay(d)),
    remove: existing.filter((d) => !after.has(d.index)).map((d) => d.index),
    unchanged: incoming.filter((d) => before.get(d.index) === canonicalDay(d)).length,
  };
}

export const canonicalSections = (sections: { kind: string; title?: string | null; items: unknown }[]) =>
  JSON.stringify(sections.map((s) => ({ kind: s.kind, title: s.title || null, items: s.items })));
