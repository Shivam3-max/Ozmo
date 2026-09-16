import { describe, expect, it } from "vitest";
import { databaseUrl, describeDatabase, missingDatabaseFields, usingDatabaseFields } from "./database-url.mjs";

const fields = { DB_NAME: "u1_ozmo", DB_USER: "u1_ozmo", DB_PASSWORD: "s3cret", DB_HOST: "localhost", DB_PORT: "3306" };

describe("databaseUrl", () => {
  it("builds a URL with shared-hosting pool limits from the separate fields", () => {
    expect(databaseUrl(fields)).toBe("mysql://u1_ozmo:s3cret@localhost:3306/u1_ozmo?connection_limit=5&pool_timeout=10");
  });

  it("defaults host, port and pool limits so only three fields are required", () => {
    expect(databaseUrl({ DB_NAME: "db", DB_USER: "user", DB_PASSWORD: "pw" })).toBe(
      "mysql://user:pw@localhost:3306/db?connection_limit=5&pool_timeout=10"
    );
  });

  it("escapes passwords and usernames that would otherwise break the URL", () => {
    const url = databaseUrl({ ...fields, DB_USER: "u1@ozmo", DB_PASSWORD: "p@ss:w/rd#1 2" });
    expect(url).toContain("mysql://u1%40ozmo:p%40ss%3Aw%2Frd%231%202@localhost:3306/");
    expect(decodeURIComponent(new URL(url).password)).toBe("p@ss:w/rd#1 2");
  });

  it("honours overrides for host, port and pool limits", () => {
    expect(databaseUrl({ ...fields, DB_HOST: "127.0.0.1", DB_PORT: "3307", DB_CONNECTION_LIMIT: "3", DB_POOL_TIMEOUT: "20" })).toBe(
      "mysql://u1_ozmo:s3cret@127.0.0.1:3307/u1_ozmo?connection_limit=3&pool_timeout=20"
    );
  });

  it("uses DATABASE_URL as given when one is set", () => {
    const url = "mysql://someone:else@db.example:3306/other?connection_limit=5&pool_timeout=10";
    expect(databaseUrl({ ...fields, DATABASE_URL: url })).toBe(url);
    expect(usingDatabaseFields({ DATABASE_URL: url })).toBe(false);
    expect(usingDatabaseFields(fields)).toBe(true);
  });

  it("names exactly what is missing instead of failing later", () => {
    expect(missingDatabaseFields({ DB_NAME: "db" })).toEqual(["DB_USER", "DB_PASSWORD"]);
    expect(() => databaseUrl({ DB_NAME: "db" })).toThrow(/DB_USER, DB_PASSWORD/);
    expect(() => databaseUrl({ ...fields, DB_PORT: "three" })).toThrow(/DB_PORT must be a number/);
  });

  it("describes the connection without leaking the password", () => {
    expect(describeDatabase(fields)).toBe("localhost:3306/u1_ozmo");
    expect(describeDatabase({})).toBe("(not configured)");
  });
});
