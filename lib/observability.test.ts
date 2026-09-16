import { describe, expect, it } from "vitest";
import { errorFingerprint, safePath } from "./observability";

describe("safePath", () => {
  it("never lets one-time tokens or query strings into logs", () => {
    expect(safePath("/portal/setup/abc123secret")).toBe("/portal/setup/[token]");
    expect(safePath("/admin/setup/abc123secret")).toBe("/admin/setup/[token]");
    expect(safePath("/assessment/snapshot/tok_9?utm=x")).toBe("/assessment/snapshot/[token]");
    expect(safePath("/api/admin/leads?q=98888%2077777")).toBe("/api/admin/leads");
    expect(safePath(undefined)).toBeUndefined();
  });
});

describe("errorFingerprint", () => {
  it("keeps the error type and database code but never the message", () => {
    const err = Object.assign(new Error("Duplicate entry 'asha@example.com'"), { code: "P2002", meta: { modelName: "User" } });
    const f = errorFingerprint(err);
    expect(f).toEqual({ name: "Error", code: "P2002", model: "User" });
    expect(JSON.stringify(f)).not.toContain("asha");
  });
});
