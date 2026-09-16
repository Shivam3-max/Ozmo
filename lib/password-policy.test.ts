import { describe, expect, it } from "vitest";
import { passwordProblem } from "./password-policy";

describe("passwordProblem", () => {
  it("accepts a reasonable passphrase", () => {
    expect(passwordProblem("mango season in pune")).toBeNull();
    expect(passwordProblem("Kitchen-Garden-42")).toBeNull();
  });

  it("rejects short, common and trivial passwords", () => {
    expect(passwordProblem("password")).toMatch(/at least/);
    expect(passwordProblem("password123")).toMatch(/too common/);
    expect(passwordProblem("P@ssw0rd!!")).toMatch(/too common/); // decorated common passwords are caught too
    expect(passwordProblem("aaaaaaaaaaaa")).toMatch(/too easy/);
    expect(passwordProblem("1234567890")).toMatch(/too common|too easy/);
  });

  it("rejects passwords built from the person's own details", () => {
    const who = { name: "Asha Kulkarni", email: "asha.k@example.com", phone: "+919888877777" };
    expect(passwordProblem("kulkarni2026!", who)).toMatch(/name, email or phone/);
    expect(passwordProblem("9888877777ab", who)).toMatch(/name, email or phone/);
    expect(passwordProblem("asha.k-secure-1", who)).toMatch(/name, email or phone/);
  });
});
