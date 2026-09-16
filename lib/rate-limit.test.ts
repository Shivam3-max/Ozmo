import { describe, expect, it, vi } from "vitest";
import { clientIp, createLimiter, memoryStore, type RateLimitStore } from "./rate-limit";

const headers = (xff?: string) => new Headers(xff ? { "x-forwarded-for": xff } : {});

describe("clientIp", () => {
  it("takes the address the trusted proxy appended, not what the client sent", () => {
    // Client forged "1.1.1.1"; the single proxy appended the real 203.0.113.9.
    expect(clientIp(headers("1.1.1.1, 203.0.113.9"), 1)).toBe("203.0.113.9");
    expect(clientIp(headers("1.1.1.1, 203.0.113.9, 10.0.0.2"), 2)).toBe("203.0.113.9");
  });

  it("returns null when the address can't be trusted", () => {
    expect(clientIp(headers(), 1)).toBeNull();
    expect(clientIp(headers("203.0.113.9"), 0)).toBeNull();
    expect(clientIp(headers("203.0.113.9"), 2)).toBeNull();
    expect(clientIp(headers("not-an-ip"), 1)).toBeNull();
  });
});

describe("rate limiting", () => {
  it("counts only recorded hits and blocks at the limit", async () => {
    const { limitedFor, recordHit } = createLimiter(memoryStore());
    expect(await limitedFor("k", 2)).toBe(0);
    await recordHit("k", 60_000);
    expect(await limitedFor("k", 2)).toBe(0);
    await recordHit("k", 60_000);
    expect(await limitedFor("k", 2)).toBeGreaterThan(0);
  });

  it("rateLimit checks and counts in one step", async () => {
    const { rateLimit } = createLimiter(memoryStore());
    expect((await rateLimit("k", 2, 60_000)).ok).toBe(true);
    expect((await rateLimit("k", 2, 60_000)).ok).toBe(true);
    const third = await rateLimit("k", 2, 60_000);
    expect(third.ok).toBe(false);
    expect(third.retryAfter).toBeGreaterThan(0);
  });

  it("a window that has passed starts counting again", async () => {
    // Controlled clock, so a slow machine can't expire the window between calls.
    vi.useFakeTimers({ now: new Date("2026-09-14T10:00:00Z") });
    try {
      const { rateLimit } = createLimiter(memoryStore());
      expect((await rateLimit("k", 1, 60_000)).ok).toBe(true);
      expect((await rateLimit("k", 1, 60_000)).ok).toBe(false);
      vi.setSystemTime(new Date("2026-09-14T10:01:01Z"));
      expect((await rateLimit("k", 1, 60_000)).ok).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("unknown addresses share one larger bucket", async () => {
    const { limitByIp } = createLimiter(memoryStore());
    const prev = process.env.TRUSTED_PROXY_COUNT;
    process.env.TRUSTED_PROXY_COUNT = "1";
    for (let i = 0; i < 20; i++) expect((await limitByIp(headers(), "form", 1, 60_000)).ok).toBe(true);
    expect((await limitByIp(headers(), "form", 1, 60_000)).ok).toBe(false);
    expect((await limitByIp(headers("203.0.113.9"), "form", 1, 60_000)).ok).toBe(true);
    process.env.TRUSTED_PROXY_COUNT = prev;
  });

  it("memory store evicts the oldest bucket when full", async () => {
    const store = memoryStore(2);
    await store.hit("a", 60_000);
    await store.hit("b", 60_000);
    await store.hit("c", 60_000);
    expect(await store.peek("a")).toBeNull();
    expect(await store.peek("c")).not.toBeNull();
  });

  it("keeps limiting when the primary store is down (falls back rather than failing open or closed)", async () => {
    const broken: RateLimitStore = { hit: () => Promise.reject(new Error("db down")), peek: () => Promise.reject(new Error("db down")) };
    const fallback = memoryStore();
    const store: RateLimitStore = {
      hit: (k, w) => broken.hit(k, w).catch(() => fallback.hit(k, w)),
      peek: (k) => broken.peek(k).catch(() => fallback.peek(k)),
    };
    const { rateLimit } = createLimiter(store);
    expect((await rateLimit("k", 1, 60_000)).ok).toBe(true);
    expect((await rateLimit("k", 1, 60_000)).ok).toBe(false);
  });
});
