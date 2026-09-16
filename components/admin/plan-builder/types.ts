import type { ItemType } from "@/lib/plan-types";

export type LibraryItem = { id: string; name: string; category: string; servingUnit: string; defaultType: ItemType };

export type ClientCtx = {
  id: string; name: string; code: string;
  goal?: string | null; conditions: string[];
  allergies: string[]; dislikes: string[]; foodPreference?: string | null;
  suggested?: { calories: number; protein: number; carbs: number; fat: number } | null;
};

export const TYPE_STYLE: Record<ItemType, string> = {
  FOOD: "bg-[var(--tint)] text-[var(--ink-2)]",
  SUPPLEMENT: "bg-[var(--accent)]/25 text-[var(--accent-text)]",
  EXERCISE: "bg-[var(--good)]/12 text-[var(--good)]",
  BREATHWORK: "bg-[#5A8FA8]/14 text-[#3D6E86]",
  LIFESTYLE: "bg-[#7A6FA8]/14 text-[#5C5185]",
  HYDRATION: "bg-[#2E8FB0]/12 text-[#226F8A]",
  PREP: "bg-[var(--watch)]/12 text-[var(--watch)]",
  NOTE: "bg-[var(--line-soft)] text-[var(--ink-3)]",
};

export const inputCls =
  "min-h-[38px] w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 text-[14px] focus:border-[var(--ink)] focus:outline-none";

export const pill = "rounded-full border border-[var(--line)] px-4 py-2 text-[13.5px] font-semibold hover:border-[var(--ink)]";
