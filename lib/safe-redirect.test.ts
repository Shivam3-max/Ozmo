import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it("keeps destinations inside the requested authenticated surface", () => {
    expect(safeRedirectPath("/admin/clients?view=active", "/admin")).toBe("/admin/clients?view=active");
    expect(safeRedirectPath("/portal/messages", "/portal")).toBe("/portal/messages");
  });

  it("rejects external, script, cross-surface and backslash destinations", () => {
    expect(safeRedirectPath("https://evil.example", "/admin")).toBe("/admin");
    expect(safeRedirectPath("javascript:alert(1)", "/admin")).toBe("/admin");
    expect(safeRedirectPath("/portal", "/admin")).toBe("/admin");
    expect(safeRedirectPath("/admin\\evil", "/admin")).toBe("/admin");
  });
});
