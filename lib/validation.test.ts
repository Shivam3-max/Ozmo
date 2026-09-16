import { describe, expect, it } from "vitest";
import { assessmentSchema } from "./validation";
import { planWarnings } from "./plan-types";

const contact = { email: "asha@example.com", phone: "+91 98888 77777", city: "Pune", consentService: true, consentMarketing: false };
const answers = {
  name: "Asha",
  age: "34",
  gender: "Female",
  height: "160",
  weight: "72",
  goal: "Lose weight",
  conditions: ["PCOS / PCOD"],
  typicalDay: { breakfast: "Poha at 9", dinner: "" },
  blocker: "Late office dinners",
  readiness: "Ready to start",
};

const check = (overrides: Record<string, unknown>) =>
  assessmentSchema.safeParse({ answers: { ...answers, ...overrides }, contact });

describe("assessmentSchema", () => {
  it("accepts a realistic submission", () => {
    expect(check({}).success).toBe(true);
  });

  it("rejects values that would store nonsense or overflow a column", () => {
    expect(check({ age: "abc" }).success).toBe(false);
    expect(check({ age: "99999999999" }).success).toBe(false);
    expect(check({ weight: "-50" }).success).toBe(false);
    expect(check({ height: "0.0001" }).success).toBe(false);
    expect(check({ name: "N".repeat(300) }).success).toBe(false);
    expect(check({ goal: "x".repeat(500) }).success).toBe(false);
    expect(check({ conditions: ["Something invented"] }).success).toBe(false);
    expect(check({ typicalDay: { lunch: "x".repeat(501) } }).success).toBe(false);
    expect(check({ isAdmin: true }).success).toBe(false);
  });

  it("allows optional questions to be left blank", () => {
    expect(check({ blocker: "", typicalDay: "" }).success).toBe(true);
  });
});

describe("planWarnings", () => {
  it("blocks an allergen and non-veg food in a vegetarian plan", () => {
    const plan = { days: [{ slots: [{ label: "Breakfast", items: [{ text: "Peanut chikki" }, { text: "Egg bhurji" }] }] }] };
    const blockers = planWarnings(plan, { allergies: ["peanut"], dislikes: [], foodPreference: "Vegetarian" })
      .filter((w) => w.severity === "block");
    expect(blockers.map((b) => b.item)).toEqual(["Peanut chikki", "Egg bhurji"]);
  });
});
