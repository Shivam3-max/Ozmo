import { describe, expect, it } from "vitest";
import { formatPhone, normalizePhone } from "./phone";

describe("normalizePhone", () => {
  it("stores every common way of typing an Indian mobile the same way", () => {
    for (const typed of ["98888 77777", "9888877777", "098888-77777", "+91 98888 77777", "+91 (98888) 77777", "919888877777", "0091 98888 77777"]) {
      expect(normalizePhone(typed), typed).toBe("+919888877777");
    }
  });

  it("keeps international numbers that carry their country code", () => {
    expect(normalizePhone("+44 20 7946 0958")).toBe("+442079460958");
    expect(normalizePhone("+1 (415) 555-0100")).toBe("+14155550100");
  });

  it("rejects values that aren't a usable number", () => {
    for (const bad of ["abcdefgh", "12345", "+91 98888 7777", "0123456789", "555-0100", "", "+0 123 456 789"]) {
      expect(normalizePhone(bad), bad).toBeNull();
    }
  });
});

describe("formatPhone", () => {
  it("formats stored Indian numbers for reading and leaves others alone", () => {
    expect(formatPhone("+919888877777")).toBe("+91 98888 77777");
    expect(formatPhone("+442079460958")).toBe("+442079460958");
    expect(formatPhone(null)).toBe("");
  });
});
