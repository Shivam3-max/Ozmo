import { describe, expect, it } from "vitest";
import { addDays, clinicDateKey, clinicDay, clinicHour, clinicMidnight, clinicWeekday, dayKey, daysBetween } from "./clinic-time";

// These instants are chosen so the UTC date and the IST date differ — exactly
// the hours a UTC server used to get wrong.
const earlyMorningIst = new Date("2026-09-13T23:45:00.000Z"); // 05:15 IST on Monday 14 Sept
const lateEveningIst = new Date("2026-09-13T17:00:00.000Z"); // 22:30 IST on Sunday 13 Sept

describe("clinic calendar", () => {
  it("uses the clinic's date, not UTC's", () => {
    expect(clinicDateKey(earlyMorningIst)).toBe("2026-09-14");
    expect(clinicDateKey(lateEveningIst)).toBe("2026-09-13");
  });

  it("represents a day as midnight UTC of that date", () => {
    expect(clinicDay(earlyMorningIst).toISOString()).toBe("2026-09-14T00:00:00.000Z");
    expect(dayKey(clinicDay(earlyMorningIst))).toBe("2026-09-14");
  });

  it("knows the clinic's weekday and hour", () => {
    expect(clinicWeekday(earlyMorningIst)).toBe(0); // Monday
    expect(clinicWeekday(lateEveningIst)).toBe(6); // Sunday
    expect(clinicHour(earlyMorningIst)).toBe(5);
    expect(clinicHour(lateEveningIst)).toBe(22);
  });

  it("finds the instant the clinic day began", () => {
    expect(clinicMidnight(earlyMorningIst).toISOString()).toBe("2026-09-13T18:30:00.000Z");
  });

  it("counts whole days between date-only values", () => {
    const start = clinicDay(new Date("2026-09-01T10:00:00.000Z"));
    expect(daysBetween(start, addDays(start, 13))).toBe(13);
  });
});
