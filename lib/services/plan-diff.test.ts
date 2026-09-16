import { describe, expect, it } from "vitest";
import { describePlanIssue, diffDays, planSaveSchema, type DayInput } from "./plan-diff";

const item = (text: string) => ({ type: "FOOD" as const, text, quantity: null, prepNote: null, optionGroup: null, foodId: null });
const day = (index: number, label: string, rows: string[]): DayInput => ({
  index, label, slots: [{ label: "Breakfast", timeHint: null, condition: null, optionNote: null, items: rows.map(item) }],
});
const stored = (d: DayInput) => ({
  index: d.index, label: d.label,
  slots: d.slots.map((s) => ({
    label: s.label, timeHint: s.timeHint ?? null, condition: s.condition ?? null, optionNote: s.optionNote ?? null,
    items: s.items.map((i) => ({ type: i.type, text: i.text, quantity: i.quantity ?? null, prepNote: i.prepNote ?? null, optionGroup: i.optionGroup ?? null, foodId: i.foodId ?? null })),
  })),
});

describe("diffDays", () => {
  const monday = day(0, "Monday", ["Poha"]);
  const tuesday = day(1, "Tuesday", ["Idli"]);

  it("writes nothing when nothing changed", () => {
    const d = diffDays([stored(monday), stored(tuesday)], [monday, tuesday]);
    expect(d).toMatchObject({ create: [], replace: [], remove: [], unchanged: 2 });
  });

  it("rewrites only the edited day", () => {
    const edited = day(1, "Tuesday", ["Idli", "Sambar"]);
    const d = diffDays([stored(monday), stored(tuesday)], [monday, edited]);
    expect(d.replace.map((x) => x.index)).toEqual([1]);
    expect(d.unchanged).toBe(1);
  });

  it("ignores whitespace and null-vs-undefined differences", () => {
    const same = { ...monday, slots: [{ ...monday.slots[0], label: " Breakfast ", timeHint: undefined, items: [item(" Poha ")] }] };
    expect(diffDays([stored(monday)], [same]).replace).toEqual([]);
  });

  it("creates new days and removes dropped ones", () => {
    const d = diffDays([stored(monday), stored(tuesday)], [monday, day(2, "Wednesday", [])]);
    expect(d.create.map((x) => x.index)).toEqual([2]);
    expect(d.remove).toEqual([1]);
  });
});

describe("describePlanIssue", () => {
  it("names the day, slot and row of the problem", () => {
    const payload = {
      title: "Plan", dayMode: "WEEK", dayCount: 7, showTargets: false, sections: [], expectedUpdatedAt: "x",
      days: [day(0, "Monday", ["ok"]), day(1, "Tuesday", ["ok", "x".repeat(2001)])],
    };
    const parsed = planSaveSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
    const message = describePlanIssue(parsed.error!.issues[0], payload);
    expect(message).toBe("Tuesday → Breakfast → row 2 is longer than 2000 characters.");
  });

  it("falls back to the plain message for top-level fields", () => {
    const payload = { title: "", dayMode: "SINGLE", dayCount: 1, showTargets: false, days: [], sections: [], expectedUpdatedAt: "x" };
    const parsed = planSaveSchema.safeParse(payload);
    expect(describePlanIssue(parsed.error!.issues[0], payload)).toBe("The plan needs a title.");
  });
});
