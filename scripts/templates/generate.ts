import type { Profile } from "./types.ts";
import { PROFILES_A } from "./profiles-a.ts";
import { PROFILES_B } from "./profiles-b.ts";
import type { Template, TplDay, TplItem, TplSlot } from "../plan-templates.ts";

export const PROFILES: Profile[] = [...PROFILES_A, ...PROFILES_B];

const food = (text: string, optionGroup?: number): TplItem => ({ type: "FOOD", text, ...(optionGroup ? { optionGroup } : {}) });
const pick = <T,>(pool: T[], i: number) => pool[i % pool.length];

/** Wakeup, practices, supplements and bedtime repeat — they become the every-day rows. */
function commonSlots(p: Profile, order = 0): TplSlot[] {
  const slots: TplSlot[] = [
    { label: "Wakeup", items: p.wakeup.map((t) => food(t)), order } as TplSlot,
  ];
  if (p.supplements?.length) {
    slots.push({ label: "Supplements", items: p.supplements.map((t) => ({ type: "SUPPLEMENT", text: t } as TplItem)) });
  }
  if (p.practices?.length) {
    slots.push({ label: "Daily practice", items: p.practices.map((t) => ({ type: "EXERCISE", text: t } as TplItem)) });
  }
  slots.push({ label: "Before bed", items: p.bedtime.map((t) => food(t)) });
  return slots;
}

function sections(p: Profile) {
  const out: Template["sections"] = [{ kind: "GUIDELINES", title: "Guidelines", items: p.guidelines }];
  if (p.notes?.length) out.push({ kind: "NOTES", title: "Notes", items: p.notes });
  return out;
}

/** One day, with each meal offered as a labelled set of interchangeable options. */
function singleDay(p: Profile): Template {
  const meal = (label: string, pool: string[], timeHint?: string): TplSlot => ({
    label,
    timeHint,
    optionNote: pool.length > 1 ? "Any 1 from the given options" : undefined,
    items: pool.map((t) => food(t, pool.length > 1 ? 1 : undefined)),
  });

  const day: TplDay = {
    index: 0,
    label: "Every day",
    slots: [
      { label: "Wakeup", items: p.wakeup.map((t) => food(t)) },
      meal("Breakfast", p.breakfasts, "8:30 am"),
      meal("Mid-morning", p.midMorning, "11 am"),
      meal("Lunch", p.lunches, "1:30 pm"),
      meal("Evening", p.evenings, "5 pm"),
      meal("Dinner", p.dinners, "8 pm"),
      ...(p.supplements?.length ? [{ label: "Supplements", items: p.supplements.map((t) => ({ type: "SUPPLEMENT", text: t } as TplItem)) }] : []),
      ...(p.practices?.length ? [{ label: "Daily practice", items: p.practices.map((t) => ({ type: "EXERCISE", text: t } as TplItem)) }] : []),
      { label: "Before bed", items: p.bedtime.map((t) => food(t)) },
    ],
  };

  return {
    name: `${p.label}${p.dietPreference ? ` — ${p.dietPreference}` : ""}`,
    description: `${p.focus} Single day with interchangeable options at every meal.`,
    dietPreference: p.dietPreference,
    conditions: p.conditions,
    tags: [p.category.toLowerCase(), "single-day", ...(p.dietPreference ? [p.dietPreference.toLowerCase()] : [])],
    dayMode: "SINGLE",
    dayCount: 1,
    days: [day],
    sections: sections(p),
  };
}

/** A rotation — the same shape she uses in her 3-day plan, extended across the week. */
function rotation(p: Profile, days: number, mode: "WEEK" | "SEQUENCE"): Template {
  const names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const built: TplDay[] = [{ index: -1, label: "Every day", slots: commonSlots(p) }];

  for (let i = 0; i < days; i++) {
    built.push({
      index: i,
      label: mode === "WEEK" ? names[i] ?? `Day ${i + 1}` : `Day ${i + 1}`,
      slots: [
        { label: "Breakfast", timeHint: "8:30 am", items: [food(pick(p.breakfasts, i))] },
        { label: "Mid-morning", timeHint: "11 am", items: [food(pick(p.midMorning, i))] },
        { label: "Lunch", timeHint: "1:30 pm", items: [food(pick(p.lunches, i))] },
        { label: "Evening", timeHint: "5 pm", items: [food(pick(p.evenings, i))] },
        { label: "Dinner", timeHint: "8 pm", items: [food(pick(p.dinners, i))] },
      ],
    });
  }

  const label = mode === "WEEK" ? "7 Day Rotation" : `${days} Day Plan`;
  return {
    name: `${p.label} — ${label}${p.dietPreference ? ` (${p.dietPreference})` : ""}`,
    description: `${p.focus} ${mode === "WEEK" ? "A full week with a different meal each day and shared daily rituals." : `A ${days}-day sequence for a focused block.`}`,
    dietPreference: p.dietPreference,
    conditions: p.conditions,
    tags: [p.category.toLowerCase(), mode === "WEEK" ? "7-day" : `${days}-day`, ...(p.dietPreference ? [p.dietPreference.toLowerCase()] : [])],
    dayMode: mode,
    dayCount: days,
    days: built,
    sections: sections(p),
  };
}

/** Clinical concerns get a 15-day block; lifestyle ones don't need it. */
const SEQUENCE_KEYS = new Set([
  "weight-loss-veg", "weight-loss-nonveg", "diabetes-veg", "diabetes-nonveg",
  "prediabetes", "fatty-liver", "cholesterol", "hypertension",
  "pcos-ir", "hypothyroid", "bloating-acidity", "ibs-starter",
]);

export function generateTemplates(): Template[] {
  const out: Template[] = [];
  for (const p of PROFILES) {
    out.push(singleDay(p));
    out.push(rotation(p, 7, "WEEK"));
    if (SEQUENCE_KEYS.has(p.key)) out.push(rotation(p, 15, "SEQUENCE"));
  }
  return out;
}
