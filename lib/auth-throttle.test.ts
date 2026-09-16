import { describe, expect, it } from "vitest";
import { FREE_ATTEMPTS, lockoutMinutes, throttleKey } from "./auth-throttle";

describe("lockoutMinutes", () => {
  it("allows a few mistakes, then backs off exponentially up to an hour", () => {
    for (let n = 0; n < FREE_ATTEMPTS; n++) expect(lockoutMinutes(n)).toBe(0);
    expect(lockoutMinutes(FREE_ATTEMPTS)).toBe(1);
    expect(lockoutMinutes(FREE_ATTEMPTS + 1)).toBe(2);
    expect(lockoutMinutes(FREE_ATTEMPTS + 3)).toBe(8);
    expect(lockoutMinutes(FREE_ATTEMPTS + 20)).toBe(60);
  });
});

describe("throttleKey", () => {
  it("treats the same identifier the same regardless of case or spacing", () => {
    expect(throttleKey("staff", " Admin@Clinic.com ")).toBe(throttleKey("staff", "admin@clinic.com"));
  });

  it("keeps staff and client counters separate and never stores the identifier", () => {
    const key = throttleKey("staff", "admin@clinic.com");
    expect(key).not.toBe(throttleKey("client", "admin@clinic.com"));
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });
});
