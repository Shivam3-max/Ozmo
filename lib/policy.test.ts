import { describe, expect, it } from "vitest";
import { PERMISSIONS, can, isStaffRole, scopeFor, type Action } from "./policy";

/**
 * The permission table, spelled out. A change to who can do what should fail
 * here and be a deliberate edit to both files.
 */
const EXPECTED: Record<string, Action[]> = {
  SUPER_ADMIN: Object.keys(PERMISSIONS).filter((a) => a !== "portal.self") as Action[],
  DIETITIAN: [
    "practice.access", "leads.manage", "appointments.manage", "enquiries.manage", "clients.editContact",
    "health.read", "measurements.record", "messages.reply", "documents.read", "documents.upload",
    "clients.create", "clients.convertLead", "clients.editClinical", "plans.edit", "foods.edit", "notes.write", "reports.write", "portal.invite",
  ],
  ASSISTANT: [
    "practice.access", "leads.manage", "appointments.manage", "enquiries.manage", "clients.editContact",
    "health.read", "measurements.record", "messages.reply", "documents.read", "documents.upload",
  ],
  FRONT_DESK: ["practice.access", "leads.manage", "appointments.manage", "enquiries.manage", "clients.editContact"],
  CLIENT: ["portal.self"],
};

describe("policy", () => {
  for (const [role, allowed] of Object.entries(EXPECTED)) {
    it(`${role} can do exactly what's listed`, () => {
      const actual = (Object.keys(PERMISSIONS) as Action[]).filter((a) => can(role, a));
      expect(actual.sort()).toEqual([...allowed].sort());
    });
  }

  it("denies unknown roles everything", () => {
    for (const a of Object.keys(PERMISSIONS) as Action[]) expect(can("HACKER", a)).toBe(false);
  });

  it("front desk never reads health data", () => {
    expect(can("FRONT_DESK", "health.read")).toBe(false);
    expect(can("FRONT_DESK", "documents.read")).toBe(false);
  });

  it("only the client scope serves portal actions", () => {
    expect(scopeFor("portal.self")).toBe("client");
    expect(scopeFor("plans.edit")).toBe("staff");
    expect(isStaffRole("CLIENT")).toBe(false);
    expect(isStaffRole("ASSISTANT")).toBe(true);
  });
});
