import { test, expect, type APIRequestContext, type APIResponse } from "@playwright/test";
import { Actor, completeSetup, env, runId, staffLogin, uniquePhone } from "./helpers";

/**
 * Who can do what. Every sensitive endpoint is exercised as each role, and the
 * result must match the permission model — in particular that front desk never
 * reaches health data and nobody but the administrator manages staff.
 */

type Role = "anonymous" | "client" | "frontDesk" | "assistant" | "dietitian" | "admin";
const ROLES: Role[] = ["anonymous", "client", "frontDesk", "assistant", "dietitian", "admin"];
const STAFF: Role[] = ["frontDesk", "assistant", "dietitian", "admin"];
const HEALTH: Role[] = ["assistant", "dietitian", "admin"];
const CLINICAL: Role[] = ["dietitian", "admin"];

const actors = {} as Record<Role, Actor>;
// Each actor gets its own request context. A context keeps a cookie jar, so sharing one
// would silently send the last signed-in session along with "anonymous" requests.
const contexts: APIRequestContext[] = [];
let fresh: () => Promise<APIRequestContext>;
const ids = { clientId: "", leadId: "" };

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ playwright, baseURL }) => {
  fresh = async () => {
    const context = await playwright.request.newContext({ baseURL });
    contexts.push(context);
    return context;
  };
  actors.anonymous = new Actor(await fresh(), null, "anonymous");
  actors.admin = await staffLogin(await fresh(), env("E2E_ADMIN_EMAIL"), env("E2E_ADMIN_PASSWORD"), "admin");
  actors.dietitian = await staffLogin(await fresh(), env("E2E_DIETITIAN_EMAIL"), env("E2E_DIETITIAN_PASSWORD"), "dietitian");

  for (const [role, apiRole] of [["assistant", "ASSISTANT"], ["frontDesk", "FRONT_DESK"]] as const) {
    const res = await actors.admin.send("POST", "/api/admin/staff", {
      name: `E2E ${role} ${runId}`, email: `e2e-${role.toLowerCase()}-${runId}@example.test`, role: apiRole,
    });
    expect(res.status(), `create ${role}`).toBe(201);
    actors[role] = await completeSetup(await fresh(), "/api/auth/staff-setup", (await res.json()).path, "quiet river lantern north", role);
  }

  const client = await actors.dietitian.send("POST", "/api/admin/clients", {
    name: `E2E Client ${runId}`, phone: uniquePhone(1), programSlug: "weight-transformation", durationMonths: 3,
  });
  expect(client.status(), "create client").toBe(201);
  ids.clientId = (await client.json()).clientId;

  const invite = await actors.dietitian.send("POST", `/api/admin/clients/${ids.clientId}/invite`, {});
  expect(invite.status(), "portal invite").toBe(200);
  actors.client = await completeSetup(await fresh(), "/api/portal/setup", (await invite.json()).path, "monsoon tea garden west", "client");

  const lead = await actors.admin.send("POST", "/api/admin/leads", { name: `E2E Lead ${runId}`, phone: uniquePhone(2), source: "PHONE" });
  expect(lead.status(), "create lead").toBe(201);
  ids.leadId = (await lead.json()).leadId;
});

type Check = {
  name: string;
  allowed: Role[];
  call: (actor: Actor, role: Role, index: number) => Promise<APIResponse>;
  /** Statuses that count as "allowed" (default: anything below 400). */
  ok?: number[];
};

const checks: Check[] = [
  { name: "add a lead", allowed: STAFF, ok: [201, 409],
    call: (a, _r, i) => a.send("POST", "/api/admin/leads", { name: `Matrix ${runId}`, phone: uniquePhone(10 + i), source: "PHONE" }) },
  { name: "add a client", allowed: CLINICAL, ok: [201, 409],
    call: (a, _r, i) => a.send("POST", "/api/admin/clients", { name: `Matrix Client ${runId}`, phone: uniquePhone(20 + i), programSlug: "weight-transformation", durationMonths: 3 }) },
  { name: "record a client measurement", allowed: HEALTH, ok: [201],
    call: (a) => a.send("POST", `/api/admin/clients/${ids.clientId}/measurements`, { weightKg: 70 }) },
  { name: "issue a portal invite", allowed: CLINICAL, ok: [409],
    // The client already has a password, so an allowed role is told to use a reset (409) — past authorisation, nothing issued.
    call: (a) => a.send("POST", `/api/admin/clients/${ids.clientId}/invite`, {}) },
  { name: "edit a client's contact details", allowed: STAFF, ok: [200],
    call: (a) => a.send("PATCH", `/api/admin/clients/${ids.clientId}`, { city: "Pune" }) },
  { name: "edit a client's health details", allowed: CLINICAL, ok: [200],
    call: (a) => a.send("PATCH", `/api/admin/clients/${ids.clientId}`, { heightCm: 165 }) },
  { name: "start a diet plan", allowed: CLINICAL, ok: [201],
    call: (a) => a.send("POST", "/api/admin/plans", { clientId: ids.clientId }) },
  { name: "schedule an appointment", allowed: STAFF, ok: [201, 409],
    call: (a, _r, i) => {
      const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(Date.now() + (100 + i) * 864e5));
      return a.send("POST", "/api/admin/appointments", { leadId: ids.leadId, type: "INITIAL", mode: "IN_CLINIC", date, time: "08:15", durationMin: 15 });
    } },
  { name: "add a staff member", allowed: ["admin"], ok: [201],
    call: (a, r) => a.send("POST", "/api/admin/staff", { name: `Matrix Staff ${runId}`, email: `matrix-${r.toLowerCase()}-${runId}@example.test`, role: "FRONT_DESK" }) },
  { name: "close a privacy request", allowed: ["admin"], ok: [404],
    call: (a) => a.send("PATCH", "/api/admin/data-requests/not-a-real-id", { status: "COMPLETED", resolution: "test" }) },
  { name: "draft a progress report", allowed: CLINICAL, ok: [201],
    call: (a) => a.send("POST", `/api/admin/clients/${ids.clientId}/reports`, {}) },
  { name: "approve a progress report", allowed: CLINICAL, ok: [404],
    call: (a) => a.send("PATCH", "/api/admin/reports/not-a-real-id", { action: "approve" }) },
  { name: "remove a client document", allowed: HEALTH, ok: [404],
    call: (a) => a.send("DELETE", "/api/admin/documents/not-a-real-id") },
  { name: "re-send a failed email", allowed: ["admin"], ok: [404],
    call: (a) => a.send("POST", "/api/admin/notifications/not-a-real-id/retry") },
  { name: "erase a client's data", allowed: ["admin"], ok: [404],
    call: (a) => a.send("POST", "/api/admin/clients/not-a-real-id/erase", { confirmCode: "X" }) },
  { name: "mark an enquiry handled", allowed: STAFF, ok: [404],
    call: (a) => a.send("PATCH", "/api/admin/enquiries/not-a-real-id", { handled: true }) },
  { name: "download the client's own data", allowed: ["client"], ok: [200],
    call: (a) => a.get("/api/portal/export") },
  { name: "message the dietitian from the portal", allowed: ["client"], ok: [201],
    call: (a) => a.send("POST", "/api/portal/messages", { body: "Role matrix check" }) },
  { name: "change own password (wrong current password)", allowed: [...STAFF, "client"], ok: [422],
    call: (a, r) => a.send("POST", "/api/auth/password", { scope: r === "client" ? "client" : "staff", currentPassword: "definitely-not-it", newPassword: "another long passphrase" }) },
];

for (const check of checks) {
  test(`permission: ${check.name}`, async () => {
    for (const [index, role] of ROLES.entries()) {
      const res = await check.call(actors[role], role, index);
      const status = res.status();
      if (check.allowed.includes(role)) {
        const ok = check.ok ? check.ok.includes(status) : status < 400;
        expect(ok, `${role} should be allowed to ${check.name} (got ${status})`).toBe(true);
      } else {
        expect([401, 403], `${role} must not be able to ${check.name} (got ${status})`).toContain(status);
      }
    }
  });
}

test("staff pages: sensitive sections are gated by role", async () => {
  const pages: { path: string; allowed: Role[]; deniedText: RegExp }[] = [
    { path: "/admin/staff", allowed: ["admin"], deniedText: /Only the clinic administrator/ },
    { path: "/admin/security", allowed: ["admin"], deniedText: /Only the clinic administrator/ },
    { path: "/admin/notifications", allowed: ["admin"], deniedText: /Only the clinic administrator/ },
    { path: "/admin/retention", allowed: ["admin"], deniedText: /Only the clinic administrator/ },
    { path: "/admin/assessments", allowed: HEALTH, deniedText: /isn.t part of your role/ },
    { path: "/admin/plans", allowed: CLINICAL, deniedText: /aren.t part of your role/ },
  ];
  for (const p of pages) {
    for (const role of STAFF) {
      const res = await actors[role].get(p.path);
      expect(res.status(), `${role} ${p.path}`).toBe(200);
      const denied = p.deniedText.test(await res.text());
      expect(denied, `${role} ${p.path} ${p.allowed.includes(role) ? "should see the page" : "should be refused"}`).toBe(!p.allowed.includes(role));
    }
    for (const role of ["anonymous", "client"] as Role[]) {
      const res = await actors[role].get(p.path);
      expect([307, 308], `${role} is redirected away from ${p.path}`).toContain(res.status());
    }
  }
});

test("front desk can open a client file without seeing health data", async () => {
  const res = await actors.frontDesk.get(`/admin/clients/${ids.clientId}`);
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toContain("E2E Client");
  expect(html).not.toContain("Measurements");
  expect(html).not.toContain("Start weight");
});

test("writes forged from another site are refused", async () => {
  const res = await actors.admin.send("POST", "/api/admin/leads", { name: "Forged", phone: uniquePhone(9), source: "PHONE" }, { Origin: "https://evil.example" });
  expect(res.status()).toBe(403);
});

test("disabling a staff member ends their session immediately", async () => {
  const res = await actors.admin.send("POST", "/api/admin/staff", { name: `Leaver ${runId}`, email: `leaver-${runId}@example.test`, role: "FRONT_DESK" });
  const { userId, path } = await res.json();
  const leaver = await completeSetup(await fresh(), "/api/auth/staff-setup", path, "harbour kite window east", "leaver");
  expect((await leaver.send("POST", "/api/admin/leads", { name: "Before", phone: uniquePhone(7), source: "PHONE" })).status()).toBe(201);

  expect((await actors.admin.send("PATCH", `/api/admin/staff/${userId}`, { isActive: false })).status()).toBe(200);
  expect((await leaver.send("POST", "/api/admin/leads", { name: "After", phone: uniquePhone(8), source: "PHONE" })).status()).toBe(401);
});

test.afterAll(async () => {
  await Promise.all(contexts.map((c) => c.dispose()));
});
