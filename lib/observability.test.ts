import { describe, expect, it } from "vitest";
import { databaseFailureReason, errorFingerprint, safePath } from "./observability";

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

describe("databaseFailureReason", () => {
  it("points at the setting to fix, without quoting the connection", () => {
    const cases: [string, RegExp][] = [
      ["Authentication failed against database server at `localhost`", /DB_USER and DB_PASSWORD/],
      ["Unknown database `u123_ozmo`", /DB_NAME/],
      // MySQL hides whether the database exists, so this shape must not read as a password problem.
      ["Access denied for user 'u123'@'localhost' to database 'u123_ozmo'", /cannot open that database/],
      ["Can't reach database server at `localhost:3306`", /DB_HOST and DB_PORT/],
      ["Timed out fetching a new connection", /timed out/],
      ["Environment variable not found: DATABASE_URL", /set DB_NAME/],
      ["Too many connections", /DB_CONNECTION_LIMIT/],
    ];
    for (const [message, expected] of cases) {
      const reason = databaseFailureReason(new Error(message));
      expect(reason, message).toMatch(expected);
      expect(reason).not.toContain("u123_ozmo");
    }
  });

  it("says nothing when the error isn't about the connection", () => {
    expect(databaseFailureReason(new Error("Unique constraint failed"))).toBeUndefined();
    expect(databaseFailureReason("not an error")).toBeUndefined();
  });
});
