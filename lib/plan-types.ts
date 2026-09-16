export const ITEM_TYPES = [
  { value: "FOOD", label: "Food", short: "Food" },
  { value: "SUPPLEMENT", label: "Supplement", short: "Supp" },
  { value: "EXERCISE", label: "Exercise / asana", short: "Move" },
  { value: "BREATHWORK", label: "Breathwork", short: "Breath" },
  { value: "LIFESTYLE", label: "Lifestyle cue", short: "Cue" },
  { value: "HYDRATION", label: "Hydration", short: "Water" },
  { value: "PREP", label: "Household prep", short: "Prep" },
  { value: "NOTE", label: "Note", short: "Note" },
] as const;

export type ItemType = (typeof ITEM_TYPES)[number]["value"];

export type PlanItemDraft = {
  id: string;
  type: ItemType;
  text: string;
  quantity?: string;
  prepNote?: string;
  optionGroup?: number | null;
  /** Link back to the library item, so nutrition roll-ups and the delete guard
   *  keep working. Rewritten on every save, so it must survive the round trip. */
  foodId?: string | null;
};

export type PlanSlotDraft = {
  id: string;
  label: string;
  timeHint?: string;
  condition?: string;
  optionNote?: string;
  items: PlanItemDraft[];
};

export type PlanDayDraft = {
  id: string;
  index: number; // -1 = the "every day" column
  label: string;
  slots: PlanSlotDraft[];
};

export type PlanSectionDraft = {
  id: string;
  kind: "GUIDELINES" | "NOTES";
  title?: string;
  items: string[];
};

export type PlanDraft = {
  title: string;
  dayMode: "SINGLE" | "WEEK" | "SEQUENCE";
  dayCount: number;
  dietPreference?: string | null;
  conditionsNote?: string | null;
  showTargets: boolean;
  targetCalories?: number | null;
  targetProtein?: number | null;
  targetCarbs?: number | null;
  targetFat?: number | null;
  days: PlanDayDraft[];
  sections: PlanSectionDraft[];
};

/** Slot labels she actually uses — offered as suggestions, never enforced. */
export const SLOT_SUGGESTIONS = [
  "Wakeup",
  "Meal 1 at home",
  "Breakfast",
  "Office snack",
  "Mid day",
  "10 mins before lunch",
  "Lunch",
  "After 1 hr",
  "Before 30 mins of workout",
  "During and post workout",
  "Evening",
  "Post yoga",
  "Dinner",
  "30 mins after dinner",
  "Before bed",
];

export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const uid = () => Math.random().toString(36).slice(2, 10);

export function emptyPlan(title: string): PlanDraft {
  return {
    title,
    dayMode: "SINGLE",
    dayCount: 1,
    showTargets: false,
    days: [{ id: uid(), index: 0, label: "Every day", slots: [] }],
    sections: [],
  };
}

/**
 * Anything in the plan that collides with a client's stated allergy or food
 * preference. A safety check, so it is deliberately eager — better a false
 * flag she dismisses than a missed one.
 */
export function planWarnings(
  plan: { days: { slots: { label: string; items: { text: string }[] }[] }[] },
  client: { allergies: string[]; dislikes: string[]; foodPreference?: string | null }
) {
  const warnings: { slot: string; item: string; reason: string; severity: "block" | "warn" }[] = [];
  const nonVegWords = ["chicken", "fish", "mutton", "egg", "prawn", "keema", "meat"];
  const isVegetarian = /vegetarian|vegan|jain/i.test(client.foodPreference ?? "");
  const allowsEgg = /egg/i.test(client.foodPreference ?? "");

  for (const day of plan.days) {
    for (const slot of day.slots) {
      for (const item of slot.items) {
        const text = item.text.toLowerCase();

        for (const allergen of client.allergies) {
          if (allergen.trim() && text.includes(allergen.trim().toLowerCase())) {
            warnings.push({ slot: slot.label, item: item.text, reason: `Allergy: ${allergen}`, severity: "block" });
          }
        }
        for (const dislike of client.dislikes) {
          if (dislike.trim() && text.includes(dislike.trim().toLowerCase())) {
            warnings.push({ slot: slot.label, item: item.text, reason: `Disliked: ${dislike}`, severity: "warn" });
          }
        }
        if (isVegetarian) {
          const hit = nonVegWords.find((w) => (w === "egg" ? !allowsEgg : true) && text.includes(w));
          if (hit) {
            warnings.push({
              slot: slot.label,
              item: item.text,
              reason: `${hit} in a ${client.foodPreference} plan`,
              severity: "block",
            });
          }
        }
      }
    }
  }
  return warnings;
}
