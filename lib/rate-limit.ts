import { prisma } from "@/lib/db";

/**
 * Fixed-window rate limits for public forms, sign-in and portal messages.
 *
 * Counters live in the database (RateLimitBucket), so a restart or redeploy
 * doesn't reset them and a second instance shares the same limits. If the
 * database can't be reached the limiter falls back to process memory for that
 * request rather than failing the visitor. Per-account sign-in lockout is
 * separate and stricter: see lib/auth-throttle.ts.
 */
export type Bucket = { count: number; resetAt: Date };
export type RateLimitStore = {
  /** Counts one event and returns the bucket after counting. */
  hit(key: string, windowMs: number): Promise<Bucket>;
  /** The live bucket for `key`, without counting. */
  peek(key: string): Promise<Bucket | null>;
};

/** In-process store: used as the fallback, and in unit tests. */
export function memoryStore(maxBuckets = 10_000): RateLimitStore & { sweep(): void } {
  const buckets = new Map<string, Bucket>();
  const live = (key: string) => {
    const b = buckets.get(key);
    return b && b.resetAt.getTime() > Date.now() ? b : null;
  };
  return {
    async hit(key, windowMs) {
      const b = live(key);
      if (b) {
        b.count += 1;
        return b;
      }
      // Bound memory even when a caller can present many distinct addresses.
      if (!buckets.has(key) && buckets.size >= maxBuckets) {
        const oldest = buckets.keys().next().value as string | undefined;
        if (oldest) buckets.delete(oldest);
      }
      const fresh = { count: 1, resetAt: new Date(Date.now() + windowMs) };
      buckets.set(key, fresh);
      return fresh;
    },
    async peek(key) {
      return live(key);
    },
    sweep() {
      const now = Date.now();
      for (const [key, b] of buckets) if (b.resetAt.getTime() <= now) buckets.delete(key);
    },
  };
}

/** Database store. The insert-or-increment is a single atomic statement, so concurrent requests can't both slip under a limit. */
export const databaseStore: RateLimitStore = {
  async hit(key, windowMs) {
    const now = new Date();
    const resetAt = new Date(now.getTime() + windowMs);
    // MySQL applies the assignments left to right; `resetAt` in the second IF still sees the old value.
    await prisma.$executeRaw`
      INSERT INTO RateLimitBucket (\`key\`, count, resetAt) VALUES (${key}, 1, ${resetAt})
      ON DUPLICATE KEY UPDATE
        count = IF(resetAt <= ${now}, 1, count + 1),
        resetAt = IF(resetAt <= ${now}, ${resetAt}, resetAt)`;
    const row = await prisma.rateLimitBucket.findUnique({ where: { key } });
    return row ? { count: row.count, resetAt: row.resetAt } : { count: 1, resetAt };
  },
  async peek(key) {
    const row = await prisma.rateLimitBucket.findUnique({ where: { key } });
    return row && row.resetAt.getTime() > Date.now() ? { count: row.count, resetAt: row.resetAt } : null;
  },
};

/** Database first; memory if the database call fails, so a DB blip degrades limits instead of blocking people. */
function resilient(primary: RateLimitStore, fallback: RateLimitStore): RateLimitStore {
  return {
    async hit(key, windowMs) {
      try {
        return await primary.hit(key, windowMs);
      } catch {
        return fallback.hit(key, windowMs);
      }
    },
    async peek(key) {
      try {
        return await primary.peek(key);
      } catch {
        return fallback.peek(key);
      }
    },
  };
}

const secondsUntil = (d: Date) => Math.max(1, Math.ceil((d.getTime() - Date.now()) / 1000));

export function createLimiter(store: RateLimitStore) {
  /** Seconds until `key` is under `limit` again, or 0 if it already is. Does not count. */
  async function limitedFor(key: string, limit: number) {
    const b = await store.peek(key);
    return b && b.count >= limit ? secondsUntil(b.resetAt) : 0;
  }

  /** Counts one event against `key`; returns the count in the current window. */
  async function recordHit(key: string, windowMs: number) {
    return (await store.hit(key, windowMs)).count;
  }

  /** Check and count in one step — for endpoints where every request counts. */
  async function rateLimit(key: string, limit: number, windowMs: number) {
    const b = await store.hit(key, windowMs);
    if (b.count > limit) return { ok: false as const, remaining: 0, retryAfter: secondsUntil(b.resetAt) };
    return { ok: true as const, remaining: Math.max(0, limit - b.count), retryAfter: 0 };
  }

  /**
   * Per-address limit for public forms. Requests whose address is unknown share
   * one bucket with a much larger allowance, so a missing header can't let one
   * person lock every visitor out.
   */
  async function limitByIp(headers: Headers, scope: string, limit: number, windowMs: number) {
    const ip = clientIp(headers);
    return ip ? rateLimit(`${scope}:${ip}`, limit, windowMs) : rateLimit(`${scope}:unknown-address`, limit * 20, windowMs);
  }

  return { limitedFor, recordHit, rateLimit, limitByIp };
}

const fallback = memoryStore();
export const { limitedFor, recordHit, rateLimit, limitByIp } = createLimiter(resilient(databaseStore, fallback));

/**
 * The address that connected to our reverse proxy, or null when it can't be
 * trusted.
 *
 * Each proxy appends the address it received the request from to
 * X-Forwarded-For, so only the rightmost TRUSTED_PROXY_COUNT entries were
 * written by infrastructure; anything to their left came from the client and
 * can be forged. With one proxy in front (Hostinger's default) the last entry
 * is the visitor.
 *
 * `next start` fills X-Forwarded-For with the socket address only when the
 * header is absent (it never appends), so with no proxy a header-less request
 * still resolves to its real peer. Without a proxy a client could send its own
 * header, which is why production must run behind one; set
 * TRUSTED_PROXY_COUNT=0 to ignore the header entirely.
 */
export function clientIp(headers: Headers, trustedProxies = trustedProxyCount()): string | null {
  if (trustedProxies < 1) return null;
  const chain = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const ip = chain[chain.length - trustedProxies];
  return ip && /^[0-9a-fA-F:.]{3,45}$/.test(ip) ? ip : null;
}

function trustedProxyCount() {
  const raw = process.env.TRUSTED_PROXY_COUNT;
  const n = raw === undefined || raw === "" ? 1 : Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : 1;
}
