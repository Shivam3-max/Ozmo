import { expect, type APIRequestContext } from "@playwright/test";

if (process.env.E2E_ALLOW_DB_WRITES !== "1") {
  throw new Error("E2E tests write to the database. Set E2E_ALLOW_DB_WRITES=1 and point DATABASE_URL at a disposable test database.");
}

export const env = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set for the e2e tests.`);
  return value;
};

/** A unique suffix so repeated runs against the same database never collide. */
export const runId = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

/** A distinct documentation-range address per run, so per-IP rate limits don't carry across runs. */
export const runIp = `198.51.100.${(Date.now() % 250) + 1}`;

/** An Indian mobile number unique to this run and label. */
export function uniquePhone(seed: number) {
  const n = (Date.now() % 1_000_000) * 10 + (seed % 10);
  return `+919${String(n).padStart(9, "0").slice(-9)}`;
}

/**
 * A signed-in API client. Cookies are carried explicitly: production sessions
 * are Secure cookies, and the test server runs on plain http://localhost.
 */
export class Actor {
  constructor(private readonly request: APIRequestContext, readonly cookie: string | null, readonly label: string) {}

  private headers(extra: Record<string, string> = {}) {
    return { "X-Forwarded-For": runIp, ...(this.cookie ? { Cookie: this.cookie } : {}), ...extra };
  }

  get(path: string) {
    return this.request.get(path, { headers: this.headers(), maxRedirects: 0 });
  }
  send(method: "POST" | "PATCH" | "PUT" | "DELETE", path: string, data?: unknown, headers: Record<string, string> = {}) {
    return this.request.fetch(path, { method, data: data ?? {}, headers: this.headers(headers), maxRedirects: 0 });
  }
}

export function sessionCookie(setCookie: string | undefined) {
  const match = setCookie?.match(/ozmo_(?:staff|client)=[^;]+/);
  return match ? match[0] : null;
}

export async function staffLogin(request: APIRequestContext, email: string, password: string, label = email) {
  const res = await request.post("/api/auth/login", { data: { email, password }, headers: { "X-Forwarded-For": runIp } });
  expect(res.status(), `${label} can sign in`).toBe(200);
  return new Actor(request, sessionCookie(res.headers()["set-cookie"]), label);
}

/** Uses a one-time link's token to set a password and returns the signed-in actor. */
export async function completeSetup(request: APIRequestContext, endpoint: string, path: string, password: string, label: string) {
  const token = path.split("/").pop();
  const res = await request.post(endpoint, { data: { token, password }, headers: { "X-Forwarded-For": runIp } });
  expect(res.status(), `${label} completes setup`).toBe(200);
  return new Actor(request, sessionCookie(res.headers()["set-cookie"]), label);
}

/** The first free public booking slot among the eight days the booking form offers (tomorrow onwards, no Sundays). */
export async function findFreeSlot(request: APIRequestContext) {
  const ist = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
  for (let offset = 1; offset <= 9; offset++) {
    const date = ist(new Date(Date.now() + offset * 864e5));
    const res = await request.get(`/api/booking?date=${date}`);
    if (!res.ok()) continue; // Sundays and out-of-range days
    const { booked } = (await res.json()) as { booked: string[] };
    const time = ["10:00", "10:45", "11:30", "12:15", "15:00", "15:45", "16:30", "17:15", "18:00"].find((t) => !booked.includes(t));
    if (time) return { date, time, offset };
  }
  throw new Error("No free booking slot in the days the booking form shows.");
}
