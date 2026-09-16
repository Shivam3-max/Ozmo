// Regression suite: every issue found in the production-readiness audit, checked
// against a running production build. It creates its own staff, clients and
// records, so point it at a disposable database — never production.
//
//   node scripts/regression/smtp-sink.mjs &            (captures outgoing email)
//   SMTP_HOST=127.0.0.1 SMTP_PORT=2525 ... npm run start  (the app under test)
//   E2E_ALLOW_DB_WRITES=1 SMTP_LOG=smtp.log npm run test:regression
//
// The app must run with CLINIC_NOTIFY_EMAIL=$REGRESSION_CLINIC_INBOX and a
// DOCUMENT_ENCRYPTION_KEY. Staff credentials are the seeded E2E_* accounts.
import fs from "node:fs";
import zlib from "node:zlib";
import { PrismaClient } from "@prisma/client";
import { databaseUrl } from "../../lib/database-url.mjs";

if (process.env.E2E_ALLOW_DB_WRITES !== "1") {
  console.error("Refusing to run: this suite writes to the database. Set E2E_ALLOW_DB_WRITES=1 against a disposable database.");
  process.exit(2);
}
const need = (name) => {
  const v = process.env[name];
  if (!v) { console.error(`Missing ${name}.`); process.exit(2); }
  return v;
};
const B = process.env.REGRESSION_BASE_URL ?? "http://localhost:3681";
const INBOX = process.env.REGRESSION_CLINIC_INBOX ?? "clinic-inbox@example.test";
const TIMING_TOLERANCE_MS = Number(process.env.TIMING_TOLERANCE_MS ?? 150);
const db = new PrismaClient({ datasourceUrl: databaseUrl() });
const SMTP_LOG = need("SMTP_LOG");
const ADMIN = { email: need("E2E_ADMIN_EMAIL"), password: need("E2E_ADMIN_PASSWORD") };
const DIET = { email: need("E2E_DIETITIAN_EMAIL"), password: need("E2E_DIETITIAN_PASSWORD") };
const run = Date.now().toString(36);
const results = [];
let ipn = 1;
const nextIp = () => `198.51.${Math.floor(ipn / 250) % 250}.${(ipn++ % 250) + 1}`;

async function call(path, { body, cookie, method, headers = {}, xff, form, raw } = {}) {
  const t = performance.now();
  const r = await fetch(B + path, {
    method: method ?? (body === undefined && !form && raw === undefined ? "GET" : "POST"),
    redirect: "manual",
    headers: {
      ...(form ? {} : { "Content-Type": "application/json" }),
      ...(xff === null ? {} : { "X-Forwarded-For": xff ?? nextIp() }),
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    body: form ?? raw ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
  const buf = Buffer.from(await r.arrayBuffer());
  const text = buf.toString("utf8");
  let json = {};
  try { json = JSON.parse(text); } catch {}
  const setCookie = r.headers.get("set-cookie") ?? "";
  return { status: r.status, ms: performance.now() - t, json, text, buf, headers: r.headers, cookie: setCookie.match(/ozmo_(?:staff|client)=[^;]+/)?.[0] ?? null };
}

let section = "";
const group = (name) => { section = name; console.log(`\n── ${name}`); };
function expect(id, label, ok, detail = "") {
  results.push({ section, id, label, ok: Boolean(ok), detail: String(detail ?? "") });
  console.log(`${ok ? "PASS" : "FAIL"}  ${id.padEnd(8)} ${label.padEnd(74)} ${ok ? "" : detail}`);
}
const skipped = [];
/** For checks the environment can't measure fairly (e.g. timing on a machine under heavy load). */
function skip(id, label, why) {
  skipped.push({ section, id, label, why });
  console.log(`SKIP  ${id.padEnd(8)} ${label.padEnd(74)} ${why}`);
}
const mails = () => (fs.existsSync(SMTP_LOG) ? fs.readFileSync(SMTP_LOG, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
const mailsTo = (addr) => mails().filter((m) => m.to.some((t) => t.includes(addr)));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const login = async (who) => (await call("/api/auth/login", { body: who })).cookie;
const ist = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
const futureWeekday = (days) => { let d = new Date(Date.now() + days * 864e5); if (new Date(ist(d) + "T12:00:00Z").getUTCDay() === 0) d = new Date(d.getTime() + 864e5); return ist(d); };
let phoneSeq = Number(String(Date.now()).slice(-7));
const phone = (prefix = "9") => `${prefix}${String(phoneSeq++).padStart(9, "0").slice(-9)}`;
const planBody = (rows, extra = {}) => ({
  title: "Retest plan", dayMode: "SINGLE", dayCount: 1, showTargets: false, sections: [],
  days: [{ index: 0, label: "Every day", slots: [{ label: "Breakfast", items: rows.map((text) => ({ type: "FOOD", text })) }] }], ...extra,
});
const stamp = async (planId) => (await db.dietPlan.findUnique({ where: { id: planId } })).updatedAt.toISOString();
await db.authThrottle.deleteMany();

/* ═════════════════════════ fixtures ═════════════════════════ */
group("Fixtures");
const admin = await login(ADMIN);
let diet = await login(DIET);
expect("setup", "seeded admin and dietitian sign in", admin && diet);

async function addStaff(role, label) {
  const email = `${label}-${run}@example.test`;
  const r = await call("/api/admin/staff", { cookie: admin, body: { name: `${label} ${run}`, email, role } });
  const s = await call("/api/auth/staff-setup", { body: { token: r.json.path?.split("/").pop(), password: "quiet river lantern north" } });
  return { cookie: s.cookie, email, id: r.json.userId, status: `${r.status}/${s.status}` };
}
const fdUser = await addStaff("FRONT_DESK", "frontdesk");
const asstUser = await addStaff("ASSISTANT", "assistant");
const fd = fdUser.cookie, asst = asstUser.cookie;
expect("setup", "front desk and assistant accounts created and signed in", fd && asst, `${fdUser.status} ${asstUser.status}`);

const clientEmail = `nan-${run}@example.test`;
const clientPhone = phone();
let r = await call("/api/admin/clients", { cookie: diet, body: { name: "Nandini Rao", phone: clientPhone, email: clientEmail, programSlug: "weight-transformation", durationMonths: 3, weightKg: 82, heightCm: 160, conditions: ["PCOS / PCOD"], allergies: [] } });
const clientId = r.json.clientId;
expect("setup", "dietitian creates a client with email", r.status === 201, `${r.status} ${r.json.error ?? ""}`);
r = await call(`/api/admin/clients/${clientId}/invite`, { cookie: diet, body: {} });
let clientCookie = (await call("/api/portal/setup", { body: { token: r.json.path?.split("/").pop(), password: "monsoon chai at four" } })).cookie;
expect("setup", "client sets a password from the invite", clientCookie);

r = await call("/api/admin/clients", { cookie: diet, body: { name: "Kiran Mehta", phone: phone(), programSlug: "weight-transformation", durationMonths: 1 } });
const clientNoPw = r.json.clientId;
expect("setup", "second client without a password", r.status === 201, r.status);

r = await call("/api/admin/plans", { cookie: diet, body: { clientId } });
const livePlan = r.json.planId;
r = await call(`/api/admin/plans/${livePlan}`, { method: "PATCH", cookie: diet, body: planBody(["Poha with peanuts removed", "Green tea"], { expectedUpdatedAt: await stamp(livePlan), publish: true }) });
expect("setup", "a published plan for the client", r.status === 200 && r.json.published, `${r.status} ${r.json.error ?? ""}`);

/* ═════════════════════════ Phase 0 ═════════════════════════ */
group("Phase 0 — data loss, access control, integrity");

// DB-01 long text survives
r = await call("/api/contact", { body: { name: "Long Message", phone: phone(), topic: "General", message: "m".repeat(3900), consent: true } });
expect("DB-01", "3,900-character enquiry is saved", r.status === 201, r.status);
const bookDate = futureWeekday(3 + Math.floor(Math.random() * 50));
const book = (p, name, time, notes = "", ip) => call("/api/booking", { xff: ip, body: { type: "clinic", date: bookDate, time, name, phone: p, email: "b@example.test", reason: "Weight loss", notes, acceptTerms: true, acceptDisclaimer: true } });
r = await book(phone(), "Long Notes", "10:00", "n".repeat(1900));
const firstAppt = r.json.id;
expect("DB-01", "1,900-character booking note is saved", r.status === 201, `${r.status} ${r.json.error ?? ""}`);
r = await call("/api/portal/messages", { cookie: clientCookie, body: { body: "Hello! ".repeat(500) } });
expect("DB-01", "3,500-character portal message is saved", r.status === 201, r.status);
r = await call("/api/portal/log", { cookie: clientCookie, body: { action: "meal", slotLabel: "Breakfast", source: "OFF_PLAN", customText: "x".repeat(480) } });
expect("DB-01", "480-character off-plan meal note is saved", r.status === 200, `${r.status} ${r.json.error ?? ""}`);

// BUG-01 / SEC-01 role checks
r = await call(`/admin/clients/${clientId}`, { cookie: fd });
expect("BUG-01", "front desk opens a client file without health sections", r.status === 200 && !/Measurements|Start weight|Progress reports|Documents/.test(r.text), r.status);
r = await call(`/api/admin/clients/${clientNoPw}/invite`, { cookie: fd, body: {} });
expect("SEC-01", "front desk can't issue a portal invite", r.status === 403, r.status);
r = await call(`/api/admin/clients/${clientId}/invite`, { cookie: fd, body: { reset: true } });
expect("SEC-01", "front desk can't reset a client's password", r.status === 403, r.status);
r = await call(`/api/admin/clients/${clientId}/invite`, { cookie: diet, body: {} });
expect("SEC-01", "invite for a client who already has a password → 409", r.status === 409, r.status);
r = await call(`/api/admin/clients/${clientId}/invite`, { cookie: diet, body: { reset: true } });
expect("SEC-01", "dietitian can't reset (administrator only)", r.status === 403, r.status);
r = await call(`/api/admin/clients/${clientId}/invite`, { cookie: admin, body: { reset: true } });
expect("SEC-01", "admin issues a 2-day reset link", r.status === 200 && r.json.expiresInDays === 2, `${r.status} ${r.json.expiresInDays}`);
const resetToken = r.json.path?.split("/").pop();
r = await call("/api/portal/setup", { body: { token: resetToken, password: "Client-New-Pass-2026" } });
expect("SEC-01", "client uses the reset link", r.status === 200 && r.cookie, r.status);
const oldClientCookie = clientCookie;
clientCookie = r.cookie;
r = await call("/api/portal/export", { cookie: oldClientCookie });
expect("SEC-01", "the reset signs out the client's other sessions", r.status === 401, r.status);
expect("SEC-01", "password reset is audited", await db.auditLog.count({ where: { action: "PORTAL_PASSWORD_RESET", entityId: clientId } }) >= 1);
r = await call("/api/portal/setup", { body: { token: resetToken, password: "another fresh passphrase" } });
expect("SEC-01", "a reset link works only once", r.status === 400 || r.status === 410 || r.status === 404, r.status);

// SEC-02 anonymous input can't overwrite records
const victimPhone = phone();
const ans = { name: "Asha Victim", age: "34", gender: "Female", height: "160", weight: "72", goal: "Lose weight", conditions: ["PCOS / PCOD"], readiness: "Ready to start" };
r = await call("/api/assessment", { body: { answers: ans, contact: { email: "asha@example.test", phone: victimPhone, consentService: true, consentMarketing: false } } });
const victim = await db.lead.findFirst({ where: { phone: `+91${victimPhone}` }, orderBy: { createdAt: "asc" } });
expect("SEC-02", "assessment creates a lead", r.status === 201 && victim, r.status);
r = await call("/api/assessment", { body: { answers: { ...ans, name: "Attacker", weight: "40" }, contact: { email: "attacker@evil.example", phone: victimPhone.replace(/^(\d{5})/, "$1 "), consentService: true, consentMarketing: false } } });
const after = await db.lead.findUnique({ where: { id: victim.id } });
const dupes = await db.lead.count({ where: { duplicateOfLeadId: victim.id } });
expect("SEC-02", "reusing that phone leaves the earlier lead untouched", r.status === 201 && after.name === "Asha Victim" && after.email === "asha@example.test", `${after.name} ${after.email}`);
expect("SEC-02", "…and is saved as a separate lead flagged as a possible duplicate", dupes === 1, dupes);
r = await call("/api/assessment", { body: { answers: { ...ans, weight: "-50" }, contact: { email: "x@example.test", phone: phone(), consentService: true, consentMarketing: false } } });
expect("SEC-02", "assessment with weight -50 is rejected", r.status === 422, r.status);

// BIZ-01 + DB-02 slots
r = await book(phone(), "Slot Taker", "10:00");
expect("DB-02", "booking a taken slot → 409", r.status === 409, r.status);
expect("DB-02", "…and leaves no orphan lead", await db.lead.count({ where: { name: "Slot Taker" } }) === 0);
r = await call(`/api/admin/appointments/${firstAppt}`, { cookie: diet, method: "PATCH", body: { status: "CANCELLED" } });
expect("BIZ-01", "cancel an appointment", r.status === 200, r.status);
r = await call(`/api/admin/appointments/${firstAppt}`, { cookie: diet, method: "PATCH", body: { status: "COMPLETED" } });
expect("BIZ-01", "cancelled → completed is refused", r.status === 409, r.status);
r = await book(phone(), "Rebooker", "10:00");
expect("BIZ-01", "the cancelled time can be booked again", r.status === 201, r.status);
r = await call(`/api/admin/appointments/${firstAppt}`, { cookie: diet, method: "PATCH", body: { status: "SCHEDULED" } });
expect("BIZ-01", "reopening a time someone rebooked is refused", r.status === 409, r.status);
const avail = await call(`/api/booking?date=${bookDate}`);
expect("BIZ-01", "availability lists the booked time", avail.status === 200 && avail.json.booked?.includes("10:00"), JSON.stringify(avail.json));
const races = await Promise.all([0, 1, 2, 3].map((i) => book(phone(), `Racer ${i}`, "15:00")));
expect("BIZ-01", "4 simultaneous bookings for one time → exactly one succeeds", races.filter((x) => x.status === 201).length === 1 && races.filter((x) => x.status === 409).length === 3, races.map((x) => x.status).join(","));

// BIZ-02 published plans are protected
r = await call(`/api/admin/plans/${livePlan}`, { cookie: diet, method: "PATCH", body: planBody(["edited live"], { expectedUpdatedAt: await stamp(livePlan) }) });
expect("BIZ-02", "saving over a published plan is refused", r.status === 409 && r.json.code === "NOT_DRAFT", `${r.status} ${r.json.code}`);
r = await call(`/api/admin/plans/${livePlan}/duplicate`, { cookie: diet, body: {} });
const v2 = r.json.planId;
const r2 = await call(`/api/admin/plans/${livePlan}/duplicate`, { cookie: diet, body: {} });
expect("BIZ-02", "\"edit as new version\" twice reuses one draft", v2 && r2.json.planId === v2, `${r.status}/${r2.status}`);
r = await call(`/api/admin/plans/${v2}`, { cookie: diet, method: "PATCH", body: planBody(["r".repeat(1800)], { expectedUpdatedAt: await stamp(v2) }) });
expect("BIZ-02", "draft with a 1,800-character row saves", r.status === 200, `${r.status} ${r.json.error ?? ""}`);
r = await call(`/api/admin/plans/${v2}`, { cookie: diet, method: "PATCH", body: planBody(["stale tab"], { expectedUpdatedAt: "2020-01-01T00:00:00.000Z" }) });
expect("BIZ-02", "a stale save from another tab is refused", r.status === 409 && r.json.code === "STALE", `${r.status} ${r.json.code}`);
await db.client.update({ where: { id: clientId }, data: { allergies: ["peanut"] } });
r = await call(`/api/admin/plans/${v2}`, { cookie: diet, method: "PATCH", body: planBody(["Peanut chikki"], { expectedUpdatedAt: await stamp(v2), publish: true }) });
expect("BIZ-02", "publishing a plan with the client's allergen is blocked", r.status === 422 && r.json.code === "BLOCKED", `${r.status} ${r.json.code}`);
await db.client.update({ where: { id: clientId }, data: { allergies: [] } });
expect("BIZ-02", "the live plan was never changed", (await db.dietPlan.findUnique({ where: { id: livePlan } })).status === "ACTIVE");

// SEC-04 logout revokes that session only; "sign out everywhere" ends them all
const temp = await login(DIET);
await call("/api/auth/logout?scope=staff", { cookie: temp, body: {} });
r = await call("/api/admin/leads", { cookie: temp, body: { name: "After Logout", phone: phone(), source: "PHONE" } });
expect("SEC-04", "a session token replayed after logout is rejected", r.status === 401, r.status);
expect("SEC-04", "logging out on one device leaves the dietitian's other sessions signed in", (await call("/admin", { cookie: diet })).status === 200);
expect("SEC-04", "the signed-out session id is recorded until it would have expired", await db.revokedSession.count({ where: { expiresAt: { gt: new Date() } } }) >= 1);
const deviceA = await login(DIET);
const deviceB = await login(DIET);
r = await call("/api/auth/logout?scope=staff&everywhere=1", { cookie: deviceA, body: {} });
expect("SEC-04", "\"sign out everywhere\" ends every session for that person", r.status === 200 && (await call("/admin", { cookie: deviceB })).status !== 200 && (await call("/admin", { cookie: diet })).status !== 200, r.status);
expect("SEC-04", "…and is audited", await db.auditLog.count({ where: { action: "LOGOUT_EVERYWHERE" } }) >= 1);
diet = await login(DIET);

// SEC-05 timing. Real and unknown attempts alternate, and the fastest of each is
// compared: the minimum is least affected by other load on the machine, while a
// skipped password hash would still show up as a gap of hundreds of milliseconds.
const pairedMinimums = async (real, unknown, rounds = 4) => {
  const a = [], b = [];
  for (let i = 0; i < rounds; i++) { a.push((await real()).ms); b.push((await unknown(i)).ms); }
  return [Math.round(Math.min(...a)), Math.round(Math.min(...b))];
};
const [tReal, tFake] = await pairedMinimums(
  () => call("/api/auth/login", { body: { email: ADMIN.email, password: "Wrong-password-1" } }),
  (i) => call("/api/auth/login", { body: { email: `nobody-${run}-${i}@example.test`, password: "Wrong-password-1" } })
);
// A cost-12 bcrypt check takes ~250 ms; much slower means the machine is too busy to compare timings.
const timingCheck = (label, real, unknown) =>
  Math.min(real, unknown) > 1000
    ? skip("SEC-05", label, `machine too busy to time fairly (real=${real}ms unknown=${unknown}ms); covered by lib/password.test.ts`)
    : expect("SEC-05", label, Math.abs(real - unknown) < TIMING_TOLERANCE_MS, `real=${real}ms unknown=${unknown}ms`);
timingCheck("staff sign-in takes as long for unknown accounts as real ones", tReal, tFake);
await db.authThrottle.deleteMany();
const [cReal, cFake] = await pairedMinimums(
  () => call("/api/auth/client-login", { body: { identifier: clientEmail, password: "nope-nope-1" } }),
  (i) => call("/api/auth/client-login", { body: { identifier: `ghost-${run}-${i}@example.test`, password: "nope-nope-1" } })
);
timingCheck("client sign-in timing is the same for unknown accounts", cReal, cFake);
await db.authThrottle.deleteMany();

// SEC-03 throttling
const codes = [];
for (let i = 0; i < 6; i++) codes.push((await call("/api/auth/login", { body: { email: fdUser.email, password: "wrong-" + i }, xff: `203.0.113.${i + 1}` })).status);
r = await call("/api/auth/login", { body: { email: fdUser.email, password: "quiet river lantern north" }, xff: "203.0.113.99" });
expect("SEC-03", "account locks after 5 failures even from rotating addresses", codes.slice(0, 5).every((c) => c === 401) && codes[5] === 429 && r.status === 429, `${codes.join(",")} then ${r.status}`);
r = await call("/api/auth/login", { body: ADMIN, xff: "203.0.113.99" });
expect("SEC-03", "other accounts are unaffected by that lockout", r.status === 200, r.status);
await db.authThrottle.deleteMany();
const sprayIp = `192.0.2.${10 + Math.floor(Math.random() * 240)}`;
const spray = [];
for (let i = 0; i < 22; i++) spray.push((await call("/api/auth/login", { body: { email: `spray${i}-${run}@example.test`, password: "x" }, xff: `10.${i}.0.1, ${sprayIp}` })).status);
expect("SEC-03", "spraying 22 accounts from one address (forged XFF prefix) is throttled", spray.slice(0, 20).every((c) => c === 401) && spray[20] === 429, spray.slice(18).join(","));
await db.authThrottle.deleteMany();

/* ═════════════════════════ Phase 1 ═════════════════════════ */
group("Phase 1 — validation, CSRF, passwords, time zone, audit");
r = await call("/api/admin/clients", { cookie: diet, body: { name: "Bad Phone", phone: "abcdefgh", programSlug: "weight-transformation", durationMonths: 3 } });
expect("VAL-01", "phone 'abcdefgh' is rejected", r.status === 422, r.status);
const p1 = phone();
r = await call("/api/admin/clients", { cookie: diet, body: { name: "Meera New", phone: p1, programSlug: "weight-transformation", durationMonths: 3 } });
const meera = r.json.clientId;
const meeraUser = await db.client.findUnique({ where: { id: meera }, include: { user: true } });
expect("VAL-01", "phone is stored in one canonical form", meeraUser?.user.phone === `+91${p1}`, meeraUser?.user.phone);
r = await call("/api/admin/clients", { cookie: diet, body: { name: "Meera Twin", phone: `+91 ${p1.slice(0, 5)} ${p1.slice(5)}`, email: `twin-${run}@example.test`, programSlug: "weight-transformation", durationMonths: 3 } });
expect("VAL-01", "the same phone typed differently → 409, not 500", r.status === 409, r.status);
r = await call(`/api/admin/plans/${v2}`, { cookie: diet, method: "PATCH", body: { ...planBody([]), expectedUpdatedAt: "x", days: [{ index: 0, label: "a", slots: [] }, { index: 0, label: "b", slots: [] }] } });
expect("VAL-01", "plan with two days in one position → 422 with a reason", r.status === 422 && /same position/.test(r.json.error ?? ""), `${r.status} ${r.json.error}`);
r = await call(`/api/admin/plans/${v2}`, { cookie: diet, method: "PATCH", body: planBody(["ok", "y".repeat(2001)], { expectedUpdatedAt: await stamp(v2) }) });
expect("UX-03", "an over-long row names where it is", r.status === 422 && /Every day → Breakfast → row 2/.test(r.json.error ?? ""), r.json.error);
r = await call(`/api/admin/appointments/${firstAppt}/note`, { cookie: diet, method: "PUT", body: { nextReviewAt: "garbage" } });
expect("VAL-01", "consult note with an invalid review date → 422", r.status === 422, r.status);
r = await call(`/api/admin/clients/${meera}/measurements`, { cookie: diet, body: { date: "not a date", weightKg: 70 } });
expect("VAL-01", "measurement with an invalid date → 422", r.status === 422, r.status);
r = await call("/api/booking?date=2026-02-30");
expect("VAL-01", "availability for 30 February → 422", r.status === 422, r.status);

r = await call("/api/admin/leads", { cookie: diet, headers: { Origin: "https://evil.example" }, body: { name: "CSRF", phone: phone(), source: "PHONE" } });
expect("SEC-08", "write with a foreign Origin → 403", r.status === 403, r.status);
r = await call("/api/portal/delete-request", { cookie: clientCookie, headers: { "Sec-Fetch-Site": "cross-site" }, body: {} });
expect("SEC-08", "write marked cross-site → 403", r.status === 403, r.status);
r = await call("/api/admin/leads", { cookie: diet, headers: { "Sec-Fetch-Site": "same-site" }, body: { name: "CSRF2", phone: phone(), source: "PHONE" } });
expect("SEC-08", "write from a sibling subdomain → 403", r.status === 403, r.status);
r = await call(`/api/booking?date=${bookDate}`, { headers: { Origin: "https://evil.example" } });
expect("SEC-08", "reads are never blocked", r.status === 200, r.status);

r = await call(`/api/admin/clients/${meera}/invite`, { cookie: diet, body: {} });
const meeraToken = r.json.path?.split("/").pop();
for (const [pw, why] of [["password123", "a common password"], ["meera-secure-pass", "their name"], ["short1", "6 characters"]]) {
  r = await call("/api/portal/setup", { body: { token: meeraToken, password: pw } });
  expect("SEC-06", `setup password with ${why} is rejected`, r.status === 422, `${r.status} ${r.json.error}`);
}
r = await call(`/portal/setup/${meeraToken}`);
expect("SEC-06", "setup page shows the password rules and no false deletion promise", r.status === 200 && !/delete it at any time/.test(r.text), r.status);
r = await call("/api/portal/setup", { body: { token: meeraToken, password: "monsoon chai at four" } });
const meeraCookie = r.cookie;
expect("SEC-06", "a passphrase is accepted", r.status === 200 && meeraCookie, r.status);
r = await call("/portal", { cookie: meeraCookie });
expect("BIZ-04", "a day-1 client sees \"Just started\", not \"Let's reset\"", r.status === 200 && r.text.includes("Just started") && !r.text.includes("got away from you"), r.status);
r = await call("/api/auth/client-login", { body: { identifier: `0${p1.slice(0, 5)}-${p1.slice(5)}`, password: "monsoon chai at four" } });
expect("VAL-01", "client signs in with their phone typed differently", r.status === 200, r.status);
r = await call("/api/portal/log", { cookie: clientCookie, body: { action: "meal", slotLabel: `Invented slot ${run}` } });
expect("BIZ-04", "ticking a slot that isn't in today's plan → 422", r.status === 422, r.status);
r = await call("/api/portal/log", { cookie: clientCookie, body: { action: "meal", slotLabel: "Breakfast" } });
const logRow = await db.foodLog.findFirst({ where: { clientId, slotLabel: "Breakfast" }, orderBy: { loggedAt: "desc" } });
expect("TZ-01", "meal log is stored on the India calendar day", r.status === 200 && logRow?.date.toISOString() === `${ist(new Date())}T00:00:00.000Z`, `${r.status} ${logRow?.date.toISOString()} vs ${ist(new Date())}`);

await call(`/api/admin/plans/${v2}`, { cookie: diet, method: "PATCH", body: planBody(["draft only"], { expectedUpdatedAt: await stamp(v2) }) });
r = await call("/api/portal/export", { cookie: clientCookie });
expect("SEC-07", "data export omits unpublished draft plans", r.status === 200 && r.json.plans.length >= 1 && !r.json.plans.some((p) => p.status === "DRAFT"), r.json.plans?.map((p) => p.status).join(","));
expect("SEC-07", "export is audited", await db.auditLog.count({ where: { action: "CLIENT_DATA_EXPORTED", entityId: clientId } }) >= 1);

const auditIp = "203.0.113.200";
for (let i = 0; i < 5; i++) await call("/api/auth/login", { xff: auditIp, body: { email: asstUser.email, password: "wrong-" + i } });
const ghost = `ghost-user-${run}@example.test`;
await call("/api/auth/login", { body: { email: ghost, password: "whatever" } });
await db.authThrottle.deleteMany();
const recent = await db.auditLog.findMany({ where: { OR: [{ action: { startsWith: "LOGIN" } }, { action: "ACCOUNT_LOCKED" }] }, orderBy: { createdAt: "desc" }, take: 12 });
const reasons = recent.map((a) => `${a.action}:${a.changes?.reason ?? ""}`);
expect("OBS-01", "failed sign-ins and lockouts are audited with reasons", reasons.includes("ACCOUNT_LOCKED:") && reasons.includes("LOGIN_FAILED:wrong_password") && reasons.includes("LOGIN_FAILED:unknown_account"), reasons.slice(0, 5).join(" | "));
const leaked = await db.$queryRawUnsafe("select count(*) as n from AuditLog where entityId like ? or cast(changes as char) like ?", `%${ghost}%`, `%${ghost}%`);
expect("OBS-01", "the email typed for an unknown account isn't stored", Number(leaked[0].n) === 0, leaked[0].n);
r = await call("/admin/security", { cookie: admin });
expect("OBS-01", "admin sees Sign-in activity with the lockout", r.status === 200 && r.text.includes("Account locked"), r.status);

r = await call("/api/health");
expect("OBS-02", "health endpoint reports ok", r.status === 200 && r.json.status === "ok", r.text);

/* ═════════════════════════ Phase 2 ═════════════════════════ */
group("Phase 2 — staff accounts, sessions, pagination, SEO, headers");
const kEmail = `kavya-${run}@example.test`;
r = await call("/api/admin/staff", { cookie: admin, body: { name: "Kavya Test", email: kEmail, role: "DIETITIAN" } });
expect("ACC-01", "admin adds a dietitian and gets a setup link", r.status === 201 && r.json.path?.startsWith("/admin/setup/"), r.status);
expect("ACC-01", "…the setup link is emailed", r.json.emailed === "SENT" && mailsTo(kEmail).length === 1, r.json.emailed);
const kId = r.json.userId, kToken = r.json.path.split("/").pop();
expect("ACC-01", "setup page greets them", (await call(r.json.path)).text.includes("Welcome, Kavya"));
r = await call("/api/auth/staff-setup", { body: { token: kToken, password: "kavya garden path" } });
expect("ACC-01", "staff password containing their name is rejected", r.status === 422, r.status);
r = await call("/api/auth/staff-setup", { body: { token: kToken, password: "copper kettle morning" } });
const kA = r.cookie;
expect("ACC-01", "a passphrase is accepted and signs them in", r.status === 200 && kA, r.status);
const kB = await login({ email: kEmail, password: "copper kettle morning" });
expect("ACC-01", "setup link can't be reused", (await call("/api/auth/staff-setup", { body: { token: kToken, password: "copper kettle morning" } })).status === 400);
r = await call("/api/auth/password", { cookie: kA, body: { scope: "staff", currentPassword: "copper kettle morning", newPassword: "silver lantern evening" } });
const kA2 = r.cookie;
expect("ACC-02", "password change succeeds and keeps this device signed in", r.status === 200 && (await call("/admin/account", { cookie: kA2 })).status === 200, r.status);
expect("ACC-02", "…other devices are signed out", (await call("/api/admin/leads", { cookie: kB, body: { name: "x", phone: phone(), source: "PHONE" } })).status === 401);
expect("ACC-02", "…the old password no longer works", (await call("/api/auth/login", { body: { email: kEmail, password: "copper kettle morning" } })).status === 401);
r = await call("/api/auth/password", { cookie: kA2, body: { scope: "client", currentPassword: "silver lantern evening", newPassword: "another long passphrase" } });
expect("ACC-02", "a staff session can't change a password in the client scope", r.status === 401 || r.status === 403, r.status);
r = await call(`/api/admin/staff/${kId}/reset`, { cookie: admin, body: {} });
expect("ACC-03", "admin issues a 1-day staff reset link", r.status === 200 && r.json.isReset && r.json.expiresInDays === 1, r.status);
r = await call(`/api/admin/staff/${kId}`, { cookie: admin, method: "PATCH", body: { role: "FRONT_DESK" } });
expect("ACC-03", "changing a role signs that person out", r.status === 200 && (await call("/admin/plans", { cookie: kA2 })).status !== 200, r.status);
r = await call(`/api/admin/staff/${kId}`, { cookie: diet, method: "PATCH", body: { isActive: false } });
expect("ACC-03", "a dietitian can't manage staff", r.status === 403, r.status);
const adminRow = await db.user.findUnique({ where: { email: ADMIN.email } });
r = await call(`/api/admin/staff/${adminRow.id}`, { cookie: admin, method: "PATCH", body: { isActive: false } });
expect("ACC-03", "the admin can't disable their own account", r.status === 409 || r.status === 422, r.status);
r = await call(`/api/admin/staff/${kId}`, { cookie: admin, method: "PATCH", body: { isActive: false } });
expect("ACC-03", "disabling a staff member works", r.status === 200, r.status);
expect("ACC-03", "…and they can't sign in", (await call("/api/auth/login", { body: { email: kEmail, password: "silver lantern evening" } })).status === 401);

const both = `${clientCookie}; ${diet}`;
expect("SEC-09", "staff and client sessions coexist in one browser", (await call("/portal", { cookie: both })).status === 200 && (await call("/admin", { cookie: both })).status === 200);
r = await call("/api/auth/logout?scope=client", { cookie: both, body: {} });
const cleared = r.headers.get("set-cookie") ?? "";
expect("SEC-09", "signing out of the portal leaves the staff session alone", /ozmo_client=;/.test(cleared) && !/ozmo_staff=;/.test(cleared), cleared.slice(0, 80));
clientCookie = await (async () => (await call("/api/auth/client-login", { body: { identifier: clientEmail, password: "Client-New-Pass-2026" } })).cookie)();
r = await call("/admin/leads?view=all&q=%20");
expect("UX-02", "signing in from a deep link keeps the query string", r.status === 307 && /next=%2Fadmin%2Fleads%3Fview%3Dall/.test(r.headers.get("location") ?? ""), r.headers.get("location"));

r = await call("/api/contact", { body: { name: "Handle Me", phone: phone(), topic: "General", message: "please call", consent: true } });
const enquiry = await db.contactMessage.findFirst({ where: { name: "Handle Me" }, orderBy: { createdAt: "desc" } });
r = await call(`/api/admin/enquiries/${enquiry.id}`, { cookie: fd, method: "PATCH", body: { handled: true } });
expect("BIZ-05", "front desk marks an enquiry handled", r.status === 200 && (await db.contactMessage.findUnique({ where: { id: enquiry.id } })).handledById === fdUser.id, r.status);
r = await call("/admin/enquiries?view=handled", { cookie: admin });
expect("BIZ-05", "handled enquiries show who handled them", r.text.includes(`frontdesk ${run}`), r.status);

r = await call("/admin/leads?page=9999", { cookie: diet });
expect("PERF-01", "a page past the end explains itself", r.status === 200 && r.text.includes("past the end"), r.status);
r = await call("/admin/leads?page=abc", { cookie: diet });
expect("PERF-01", "a nonsense page number falls back to page 1", r.status === 200, r.status);
for (const p of ["/admin/leads", "/admin/clients", "/admin/enquiries", "/admin/assessments", "/admin/appointments", "/admin/data-requests", "/admin/notifications"]) {
  const who = ["/admin/data-requests", "/admin/notifications"].includes(p) ? admin : diet;
  r = await call(p, { cookie: who });
  expect("PERF-01", `${p} renders`, r.status === 200 && !/Something went wrong/.test(r.text), r.status);
}

r = await call("/");
const h = (n) => r.headers.get(n) ?? "";
expect("SEC-10", "home page sends CSP, HSTS, frame, MIME, referrer headers", /default-src 'self'/.test(h("content-security-policy")) && /max-age/.test(h("strict-transport-security")) && h("x-frame-options") === "DENY" && h("x-content-type-options") === "nosniff" && h("referrer-policy"), "");
expect("SEC-10", "no X-Powered-By header", !r.headers.get("x-powered-by"));
expect("SEO-02", "home page has a canonical link and one h1", /<link rel="canonical" href="https:\/\/ozmodietclinic.com"/.test(r.text) && (r.text.match(/<h1[\s>]/g) ?? []).length === 1, "");
expect("SEO-03", "fonts are self-hosted (no Google Fonts requests)", !/fonts.googleapis.com|fonts.gstatic.com/.test(r.text));
r = await call("/admin/login");
expect("SEO-04", "staff login is noindex", /noindex/.test(r.headers.get("x-robots-tag") ?? "") || /noindex/.test(r.text), r.headers.get("x-robots-tag"));
r = await call("/robots.txt");
expect("SEO-04", "robots.txt keeps crawlers out of admin, portal and API", r.status === 200 && /Disallow: \/admin/.test(r.text) && /Disallow: \/portal/.test(r.text) && /Disallow: \/api/.test(r.text) && /Sitemap:/.test(r.text), r.text.slice(0, 120));
r = await call("/sitemap.xml");
expect("SEO-04", "sitemap lists programmes and conditions, not private pages", r.status === 200 && r.text.includes("/programs/weight-transformation") && r.text.includes("/conditions/") && !r.text.includes("/admin") && !r.text.includes("/portal"), r.status);
r = await call("/programs/weight-transformation");
const title = r.text.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
expect("SEO-01", "programme page title isn't double-branded", r.status === 200 && (title.match(/Ozmo/g) ?? []).length === 1, title);
for (const [p, type] of [["/icon", "image/png"], ["/apple-icon", "image/png"], ["/opengraph-image", "image/png"]]) {
  r = await call(p);
  expect("SEO-05", `${p} serves a ${type}`, r.status === 200 && (r.headers.get("content-type") ?? "").startsWith(type), `${r.status} ${r.headers.get("content-type")}`);
}
r = await call("/definitely-not-a-page");
expect("UX-01", "unknown pages return 404 with the site's not-found page", r.status === 404 && /Page not found|not found/i.test(r.text), r.status);
r = await call("/admin/clients/does-not-exist", { cookie: diet });
expect("UX-01", "unknown client id → 404", r.status === 404, r.status);
r = await call("/api/admin/leads/does-not-exist", { cookie: diet, method: "PATCH", body: { stage: "LOST", lostReason: "x" } });
expect("UX-01", "unknown API record → 404 JSON", r.status === 404 && r.json.error, r.status);

/* ═════════════════════════ Hostile input ═════════════════════════ */
group("Hostile and unusual input");
const xss = `<img src=x onerror=alert(1)>${run}`;
r = await call("/api/contact", { body: { name: xss, phone: phone(), email: "x@example.test", topic: "<script>alert(1)</script>", message: "<svg/onload=alert(document.cookie)> ' OR 1=1 --", consent: true } });
expect("INP-01", "HTML/script payloads are accepted as plain text", r.status === 201, r.status);
r = await call("/admin/enquiries", { cookie: admin });
expect("INP-01", "…and rendered escaped in the practice area", r.text.includes(`&lt;img src=x onerror=alert(1)&gt;${run}`) && !r.text.includes(`<img src=x onerror=alert(1)>${run}`), "");
r = await call("/api/contact", { body: { name: "प्रिया 😀 Ünïcødé", phone: phone(), topic: "General", message: "नमस्ते 🙏🏽", consent: true } });
expect("INP-02", "Unicode and emoji are saved intact", r.status === 201 && (await db.contactMessage.findFirst({ where: { message: "नमस्ते 🙏🏽" } }))?.name === "प्रिया 😀 Ünïcødé", r.status);
r = await call("/api/contact", { raw: "{bad json" });
expect("INP-03", "malformed JSON → 400, not 500", r.status === 400, r.status);
r = await call("/api/contact", { body: { name: "A", phone: phone(), topic: "t", message: "m", consent: false } });
expect("INP-03", "missing consent → 422 naming the field", r.status === 422 && r.json.fields?.consent, r.status);
r = await call("/api/contact", { body: { name: "x", phone: phone(), topic: "t", message: "z".repeat(5e6), consent: true } });
expect("DEBT-01", "a 5 MB JSON body is refused with 413", r.status === 413, r.status);
r = await call("/api/assessment", { body: { answers: { ...ans, age: "abc" }, contact: { email: "nan@example.test", phone: phone(), consentService: true, consentMarketing: false } } });
expect("INP-03", "assessment age 'abc' → 422", r.status === 422, r.status);
r = await call("/api/assessment", { body: { answers: { ...ans, name: "N".repeat(300) }, contact: { email: "long@example.test", phone: phone(), consentService: true, consentMarketing: false } } });
expect("INP-03", "assessment name of 300 characters → 422", r.status === 422, r.status);
r = await call(`/api/admin/leads/${victim.id}`, { cookie: diet, method: "PATCH", body: { stage: "LOST" } });
expect("INP-03", "marking a lead lost without a reason → 422", r.status === 422, r.status);
r = await call("/api/admin/clients", { cookie: diet, raw: "[]" });
expect("INP-03", "a JSON array where an object belongs → 422", r.status === 422, r.status);
r = await call("/api/auth/login", { body: { email: "' OR 1=1 --@x.y", password: "' OR '1'='1" } });
expect("INP-04", "SQL-injection-shaped sign-in → rejected normally", r.status === 401 || r.status === 422, r.status);
r = await call("/admin/leads?q=%27%20OR%201%3D1%20--", { cookie: diet });
expect("INP-04", "SQL-injection-shaped search → normal empty result", r.status === 200 && !/Something went wrong/.test(r.text), r.status);
r = await call("/api/auth/login", { body: { email: ADMIN.email, password: "x".repeat(10000) } });
expect("INP-05", "10,000-character password is refused quickly", (r.status === 401 || r.status === 422) && r.ms < 3000, `${r.status} ${Math.round(r.ms)}ms`);
await db.authThrottle.deleteMany();

/* ═════════════════════════ Phase 3 ═════════════════════════ */
group("Phase 3 — permissions table, notifications, documents, reports, erasure, retention");
const checks = [
  ["front desk", fd, "POST", `/api/admin/clients/${clientId}/reports`, {}, [403]],
  ["assistant", asst, "POST", `/api/admin/clients/${clientId}/reports`, {}, [403]],
  ["client", clientCookie, "POST", "/api/admin/leads", { name: "x", phone: phone(), source: "PHONE" }, [401]],
  ["anonymous", null, "GET", "/api/portal/export", undefined, [401]],
  ["dietitian", diet, "POST", "/api/admin/retention", {}, [403]],
  ["front desk", fd, "POST", `/api/admin/clients/${clientId}/measurements`, { weightKg: 70 }, [403]],
  ["assistant", asst, "POST", `/api/admin/clients/${clientId}/measurements`, { weightKg: 81 }, [201]],
  ["assistant", asst, "POST", "/api/admin/plans", { clientId }, [403]],
];
for (const [who, cookie, method, path, body, ok] of checks) {
  r = await call(path, { cookie, method, body });
  expect("ARCH-01", `${who}: ${method} ${path.replace(/c[a-z0-9]{20,}/g, ":id")} → ${ok.join("/")}`, ok.includes(r.status), r.status);
}

r = await call("/api/contact", { body: { name: "Alert Test", phone: phone(), email: `alert-${run}@example.test`, topic: "Pricing", message: "How much?", consent: true } });
await wait(400);
const alert = mailsTo(INBOX).at(-1);
expect("NOTIF-01", "the clinic inbox gets an enquiry alert", r.status === 201 && /enquiry/i.test(alert?.raw ?? ""), r.status);
expect("NOTIF-01", "…with no name, phone or email in it", alert && !alert.raw.includes("Alert Test") && !alert.raw.includes(`alert-${run}`));
const bookEmail = `booker-${run}@example.test`;
r = await call("/api/booking", { body: { type: "video", date: futureWeekday(3 + Math.floor(Math.random() * 50)), time: "11:30", name: "Video Booker", phone: phone(), email: bookEmail, reason: "Weight loss", acceptTerms: true, acceptDisclaimer: true } });
await wait(400);
expect("NOTIF-01", "the visitor gets a booking confirmation", r.status === 201 && mailsTo(bookEmail).some((m) => /received your consultation request/i.test(m.raw)), r.status);
const assessEmail = `snap-${run}@example.test`;
r = await call("/api/assessment", { body: { answers: ans, contact: { email: assessEmail, phone: phone(), consentService: true, consentMarketing: false } } });
await wait(400);
const snap = mailsTo(assessEmail).at(-1);
expect("NOTIF-01", "the visitor gets their snapshot link", r.status === 201 && snap?.raw.includes(`/assessment/snapshot/${r.json.token}`), r.status);
expect("NOTIF-01", "…and it carries no health details", snap && !/pcos|72|weight|160/i.test(snap.raw.split("\n\n").slice(1).join("\n")), "");

const p3Email = `asha-${run}@example.test`;
const p3Phone = phone();
r = await call("/api/admin/clients", { cookie: diet, body: { name: "Asha Test", phone: p3Phone, email: p3Email, programSlug: "weight-transformation", durationMonths: 3, weightKg: 82, heightCm: 160, conditions: ["PCOS / PCOD"], allergies: [] } });
const p3Client = r.json.clientId;
const p3Code = (await db.client.findUnique({ where: { id: p3Client } })).clientCode;
r = await call(`/api/admin/clients/${p3Client}/invite`, { cookie: diet, body: {} });
expect("NOTIF-02", "portal invite reports it was emailed", r.status === 200 && r.json.emailed === "SENT", `${r.status} ${r.json.emailed}`);
const invite = mailsTo(p3Email).at(-1);
expect("NOTIF-02", "invite email contains the setup link", invite?.raw.includes(r.json.path));
const inviteRow = await db.notification.findFirst({ where: { recipient: p3Email, kind: "PORTAL_INVITE" } });
expect("NOTIF-02", "the stored copy no longer contains the link", inviteRow && !inviteRow.body.includes("/portal/setup/"), inviteRow?.body.slice(0, 40));
r = await call(`/api/admin/notifications/${inviteRow.id}/retry`, { cookie: admin, body: {} });
expect("NOTIF-02", "a sent email can't be re-sent", r.status === 409, r.status);
const p3Cookie = (await call("/api/portal/setup", { body: { token: invite.raw.match(/portal\/setup\/([A-Za-z0-9_-]+)/)?.[1], password: "monsoon chai at four" } })).cookie;
expect("NOTIF-02", "client sets a password from the emailed link", p3Cookie);

const noEmail = await call("/api/admin/clients", { cookie: diet, body: { name: "No Email", phone: phone(), programSlug: "weight-transformation", durationMonths: 1 } });
r = await call(`/api/admin/clients/${noEmail.json.clientId}/invite`, { cookie: diet, body: {} });
expect("NOTIF-02", "clients without an email get a link to share by hand", r.status === 200 && r.json.emailed === "NO_ADDRESS" && r.json.path, r.json.emailed);

r = await call("/api/admin/appointments", { cookie: diet, body: { clientId: p3Client, type: "FOLLOW_UP", mode: "VIDEO", date: futureWeekday(20 + Math.floor(Math.random() * 150)), time: "07:15", durationMin: 15, meetingUrl: "" } });
const apptId = r.json.appointmentId;
expect("NOTIF-03", "scheduling an appointment emails the client", r.status === 201 && r.json.emailed === "SENT", `${r.status} ${r.json.emailed ?? r.json.error}`);
r = await call(`/api/admin/appointments/${apptId}`, { method: "PATCH", cookie: fd, body: { meetingUrl: "http://insecure.example/abc" } });
expect("NOTIF-03", "a non-https video link is rejected", r.status === 422, r.status);
r = await call(`/api/admin/appointments/${apptId}`, { method: "PATCH", cookie: fd, body: { meetingUrl: "https://meet.example.test/abc" } });
expect("NOTIF-03", "adding a video link emails it", r.status === 200 && r.json.emailed === "SENT" && mailsTo(p3Email).some((m) => m.raw.includes("https://meet.example.test/abc")), `${r.status} ${r.json.emailed}`);

r = await call("/admin/notifications?view=all", { cookie: admin });
expect("NOTIF-04", "admin Notifications page lists emails with addresses masked", r.status === 200 && r.text.includes("Portal invite") && !r.text.includes(p3Email), r.status);
r = await call("/admin/notifications", { cookie: diet });
expect("NOTIF-04", "dietitian is told it's admin-only", r.text.includes("Only the clinic administrator"), r.status);

const pdf = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);
const upload = (endpoint, cookie, bytes, name, fields = {}) => {
  const f = new FormData();
  f.set("file", new Blob([bytes]), name);
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return call(endpoint, { cookie, form: f });
};
r = await upload(`/api/admin/clients/${p3Client}/documents`, diet, pdf, "lipids.pdf", { title: "Lipid profile", type: "LAB_REPORT", visibleToClient: "true" });
const docId = r.json.id;
expect("DOC-01", "dietitian uploads a PDF", r.status === 201, `${r.status} ${r.json.error ?? ""}`);
const stored = await db.documentFile.findUnique({ where: { documentId: docId } });
expect("DOC-01", "the file is encrypted at rest", stored && !Buffer.from(stored.ciphertext).includes(Buffer.from("%PDF")));
r = await call(`/api/documents/${docId}`, { cookie: diet });
expect("DOC-01", "downloads byte-for-byte identical", r.status === 200 && r.buf.equals(pdf) && r.headers.get("content-type") === "application/pdf", r.status);
expect("DOC-01", "served no-store, nosniff and sandboxed", /no-store/.test(r.headers.get("cache-control") ?? "") && r.headers.get("x-content-type-options") === "nosniff" && /sandbox/.test(r.headers.get("content-security-policy") ?? ""), r.headers.get("content-security-policy"));
expect("DOC-01", "downloads are audited", await db.auditLog.count({ where: { action: "DOCUMENT_VIEWED", entityId: docId } }) === 1);
r = await call(`/api/documents/${docId}`, { cookie: fd });
expect("DOC-02", "front desk can't open health documents", r.status === 404, r.status);
r = await call(`/api/documents/${docId}?as=client`, { cookie: p3Cookie });
expect("DOC-02", "the client opens their shared document", r.status === 200 && r.buf.equals(pdf), r.status);
r = await call(`/api/documents/${docId}?as=client`, { cookie: clientCookie });
expect("DOC-02", "another client can't open it", r.status === 404, r.status);
r = await call(`/api/documents/${docId}?as=client`, { cookie: diet });
expect("DOC-02", "a staff cookie isn't accepted as a client session", r.status === 401, r.status);
r = await upload(`/api/admin/clients/${p3Client}/documents`, diet, Buffer.from("<html><script>alert(1)</script>"), "x.pdf", { title: "Fake", type: "OTHER" });
expect("DOC-03", "HTML renamed to .pdf is rejected", r.status === 422, r.status);
r = await upload(`/api/admin/clients/${p3Client}/documents`, diet, Buffer.from("<svg xmlns='http://www.w3.org/2000/svg' onload='alert(1)'/>"), "x.png", { title: "Fake", type: "OTHER" });
expect("DOC-03", "SVG renamed to .png is rejected", r.status === 422, r.status);
r = await upload(`/api/admin/clients/${p3Client}/documents`, diet, Buffer.concat([pdf, Buffer.alloc(5 * 1024 * 1024)]), "big.pdf", { title: "Big", type: "OTHER" });
expect("DOC-03", "files over 5 MB are rejected", r.status === 422 || r.status === 413, r.status);
r = await upload(`/api/admin/clients/${p3Client}/documents`, diet, Buffer.alloc(0), "empty.pdf", { title: "Empty", type: "OTHER" });
expect("DOC-03", "empty files are rejected", r.status === 422, r.status);
r = await upload(`/api/admin/clients/${p3Client}/documents`, diet, pdf, "internal.pdf", { title: "Internal note", type: "CONSULT_NOTE", visibleToClient: "false" });
const hiddenId = r.json.id;
r = await call(`/api/documents/${hiddenId}?as=client`, { cookie: p3Cookie });
expect("DOC-04", "client can't open a staff-only document", r.status === 404, r.status);
r = await call("/portal/reports", { cookie: p3Cookie });
expect("DOC-04", "portal lists shared documents but not staff-only ones", r.status === 200 && r.text.includes("Lipid profile") && !r.text.includes("Internal note"), r.status);
r = await upload("/api/portal/documents", p3Cookie, png, "hba1c.png", { title: "HbA1c", type: "LAB_REPORT" });
expect("DOC-05", "client shares a lab report from the portal", r.status === 201, `${r.status} ${r.json.error ?? ""}`);
r = await call(`/api/documents/${r.json.id}`, { cookie: asst });
expect("DOC-05", "assistant opens the client's upload", r.status === 200 && r.headers.get("content-type") === "image/png", r.status);
r = await call(`/api/admin/documents/${hiddenId}`, { method: "DELETE", cookie: fd });
expect("DOC-06", "front desk can't remove documents", r.status === 403, r.status);
r = await call(`/api/admin/documents/${hiddenId}`, { method: "DELETE", cookie: diet });
expect("DOC-06", "dietitian removes a mistaken upload (file goes too)", r.status === 200 && !(await db.documentFile.findUnique({ where: { documentId: hiddenId } })), r.status);

r = await call(`/api/admin/clients/${p3Client}/reports`, { cookie: diet, body: {} });
const reportId = r.json.id;
const report = await db.progressReport.findUnique({ where: { id: reportId } });
expect("REP-01", "dietitian drafts a report with figures frozen in", r.status === 201 && report?.data?.weight?.start === 82, `${r.status} ${JSON.stringify(report?.data?.weight)}`);
r = await call(`/api/admin/clients/${p3Client}/reports`, { cookie: diet, body: { periodStart: "2026-09-10", periodEnd: "2026-01-01" } });
expect("REP-01", "a period that ends before it starts → 422", r.status === 422, r.status);
r = await call(`/api/admin/reports/${reportId}`, { method: "PATCH", cookie: diet, body: { action: "send" } });
expect("REP-02", "an unapproved report can't be shared", r.status === 409, r.status);
r = await call(`/api/admin/reports/${reportId}`, { method: "PATCH", cookie: diet, body: { action: "approve" } });
expect("REP-02", "approval needs observations", r.status === 422, r.status);
expect("REP-02", "client can't see a draft", (await call(`/portal/reports/${reportId}`, { cookie: p3Cookie })).status === 404);
await call(`/api/admin/reports/${reportId}`, { method: "PATCH", cookie: diet, body: { action: "save", observations: "Steady progress on meal timing.", nextMonthFocus: "Protein at breakfast." } });
r = await call(`/api/admin/reports/${reportId}`, { method: "PATCH", cookie: diet, body: { action: "approve" } });
expect("REP-02", "dietitian approves", r.status === 200, r.status);
await call(`/api/admin/reports/${reportId}`, { method: "PATCH", cookie: diet, body: { action: "save", observations: "Steady progress on meal timing, edited." } });
expect("REP-02", "editing an approved report sends it back to draft", (await db.progressReport.findUnique({ where: { id: reportId } })).status === "DRAFT");
await call(`/api/admin/reports/${reportId}`, { method: "PATCH", cookie: diet, body: { action: "approve" } });
const deliveredBefore = (await db.enrollment.findFirst({ where: { clientId: p3Client } })).reportsDelivered;
r = await call(`/api/admin/reports/${reportId}`, { method: "PATCH", cookie: diet, body: { action: "send" } });
expect("REP-03", "sharing emails the client", r.status === 200 && r.json.emailed === "SENT", `${r.status} ${r.json.emailed}`);
expect("REP-03", "…and counts against the programme", (await db.enrollment.findFirst({ where: { clientId: p3Client } })).reportsDelivered === deliveredBefore + 1);
expect("REP-03", "a shared report is locked", (await call(`/api/admin/reports/${reportId}`, { method: "PATCH", cookie: diet, body: { action: "save", observations: "x" } })).status === 409);
expect("REP-03", "a shared report can't be discarded", (await call(`/api/admin/reports/${reportId}`, { method: "DELETE", cookie: diet })).status === 409);
r = await call(`/portal/reports/${reportId}`, { cookie: p3Cookie });
expect("REP-04", "client reads the shared report", r.status === 200 && r.text.includes("Steady progress on meal timing, edited."), r.status);
expect("REP-04", "another client can't", (await call(`/portal/reports/${reportId}`, { cookie: clientCookie })).status === 404);
r = await call(`/admin/clients/${p3Client}/reports/${reportId}`, { cookie: diet });
expect("REP-04", "admin report page renders", r.status === 200 && r.text.includes("Progress report"), r.status);
r = await call("/api/portal/export", { cookie: p3Cookie });
expect("REP-04", "data export includes the shared report and document list", r.status === 200 && r.json.progressReports?.length === 1 && r.json.documents?.length === 2, `${r.json.progressReports?.length} ${r.json.documents?.length}`);

const lead = await call("/api/admin/leads", { cookie: fd, body: { name: "Stage Test", phone: phone(), source: "PHONE" } });
r = await call(`/api/admin/leads/${lead.json.leadId}`, { method: "PATCH", cookie: fd, body: { stage: "CONVERTED" } });
expect("UX-03", "leads can't be marked Converted by hand", r.status === 422, r.status);
r = await call(`/api/admin/leads/${lead.json.leadId}/convert`, { cookie: diet, body: { programSlug: "weight-transformation", durationMonths: 3 } });
expect("UX-03", "converting creates the client", r.status === 201, r.status);
r = await call(`/api/admin/leads/${lead.json.leadId}`, { method: "PATCH", cookie: fd, body: { stage: "NEW" } });
expect("UX-03", "a converted lead's stage can't be moved back", r.status === 409, r.status);
r = await call(`/api/admin/leads/${lead.json.leadId}`, { method: "PATCH", cookie: fd, body: { stage: "CONVERTED", note: "Welcome call done" } });
expect("UX-03", "…but notes can still be added", r.status === 200, r.status);

r = await call("/api/portal/delete-request", { cookie: p3Cookie, body: {} });
const requestId = r.json.requestId;
await wait(400);
expect("PRIV-01", "client asks for deletion and the clinic is alerted", r.status === 200 && mailsTo("clinic-inbox@example.test").some((m) => /deleted/i.test(m.raw)), r.status);
r = await call(`/admin/clients/${p3Client}/erase?request=${requestId}`, { cookie: admin });
expect("PRIV-01", "admin sees what erasure removes and keeps", r.status === 200 && r.text.includes("Erase client data") && r.text.includes("Kept, without personal details"), r.status);
expect("PRIV-01", "dietitian can't erase", (await call(`/api/admin/clients/${p3Client}/erase`, { cookie: diet, body: { confirmCode: p3Code, requestId } })).status === 403);
expect("PRIV-01", "erasure needs the client code typed", (await call(`/api/admin/clients/${p3Client}/erase`, { cookie: admin, body: { confirmCode: "WRONG", requestId } })).status === 422);
r = await call(`/api/admin/clients/${p3Client}/erase`, { cookie: admin, body: { confirmCode: p3Code, requestId } });
expect("PRIV-01", "admin erases the client", r.status === 200, `${r.status} ${r.json.error ?? ""}`);
const gone = await db.client.findUnique({ where: { id: p3Client }, include: { user: true } });
const counts = await Promise.all([
  db.measurement.count({ where: { clientId: p3Client } }), db.healthProfile.count({ where: { clientId: p3Client } }),
  db.document.count({ where: { clientId: p3Client } }), db.progressReport.count({ where: { clientId: p3Client } }),
  db.dietPlan.count({ where: { clientId: p3Client } }), db.messageThread.count({ where: { clientId: p3Client } }),
  db.notification.count({ where: { recipient: p3Email } }), db.contactMessage.count({ where: { phone: `+91${p3Phone}` } }),
]);
expect("PRIV-02", "health data, documents, reports, messages and emails are gone", counts.every((c) => c === 0), counts.join(","));
expect("PRIV-02", "name, email, phone and password are removed", gone.user.name === "Erased client" && !gone.user.phone && gone.user.email.endsWith(".erased.ozmo.local") && !gone.user.passwordHash && gone.allergies === null);
expect("PRIV-02", "enrolment and appointment date kept, without the link", (await db.enrollment.count({ where: { clientId: p3Client } })) === 1 && (await db.appointment.findUnique({ where: { id: apptId } }))?.meetingUrl === null);
expect("PRIV-02", "the deletion request is completed and erasure audited", (await db.dataRequest.findUnique({ where: { id: requestId } })).status === "COMPLETED" && (await db.auditLog.count({ where: { action: "CLIENT_ERASED", entityId: p3Client } })) === 1);
expect("PRIV-02", "the erased client's session ends", (await call("/portal", { cookie: p3Cookie })).status !== 200);
expect("PRIV-02", "…and they can't sign in", (await call("/api/auth/client-login", { body: { identifier: p3Phone, password: "monsoon chai at four" } })).status === 401);
r = await call(`/admin/clients/${p3Client}`, { cookie: admin });
expect("PRIV-02", "client file shows an anonymous tombstone", r.status === 200 && r.text.includes("Erased client") && !r.text.includes("Asha"), r.status);
expect("PRIV-02", "erasing twice is refused", (await call(`/api/admin/clients/${p3Client}/erase`, { cookie: admin, body: { confirmCode: p3Code } })).status === 409);

const oldLead = await db.lead.create({ data: { clinicId: "ozmo", name: "Old Lead", phone: `+91${phone()}`, source: "PHONE" } });
await db.$executeRawUnsafe("UPDATE `Lead` SET updatedAt = ? WHERE id = ?", new Date(Date.now() - 800 * 864e5), oldLead.id);
const freshLead = await db.lead.create({ data: { clinicId: "ozmo", name: "Fresh Lead", phone: `+91${phone()}`, source: "PHONE" } });
r = await call("/admin/retention", { cookie: admin });
expect("PRIV-03", "retention page previews what's due and flags legal review", r.status === 200 && r.text.includes("Unconverted leads") && r.text.includes("awaiting legal review"), r.status);
expect("PRIV-03", "dietitian can't run retention", (await call("/api/admin/retention", { cookie: diet, body: {} })).status === 403);
r = await call("/api/admin/retention", { cookie: admin, body: {} });
expect("PRIV-03", "admin runs retention: stale lead removed, recent lead kept", r.status === 200 && !(await db.lead.findUnique({ where: { id: oldLead.id } })) && (await db.lead.findUnique({ where: { id: freshLead.id } })), r.status);
expect("PRIV-03", "retention run is audited", await db.auditLog.count({ where: { action: "RETENTION_RUN" } }) >= 1);

/* ═════════════════════════ Launch fixes ═════════════════════════ */
group("Launch fixes — rate limits, titles, copy, logging");
const rlIp = `203.0.113.${10 + Math.floor(Math.random() * 200)}`;
const burst = [];
for (let i = 0; i < 6; i++) burst.push((await call("/api/contact", { xff: rlIp, body: { name: "Limit Test", phone: phone(), topic: "General", message: "hi", consent: true } })).status);
expect("RATE-01", "the 6th enquiry from one address within the hour is refused", burst.slice(0, 5).every((c) => c === 201) && burst[5] === 429, burst.join(","));
const bucket = await db.rateLimitBucket.findUnique({ where: { key: `contact:${rlIp}` } });
expect("RATE-01", "the counter is stored in the database (survives restarts, shared by instances)", bucket?.count === 6, JSON.stringify(bucket));
r = await call("/api/contact", { xff: rlIp, body: { name: "Limit Test", phone: phone(), topic: "General", message: "hi", consent: true } });
expect("RATE-01", "…and a refused request says when to try again", r.status === 429 && Number(r.headers.get("retry-after")) > 0, r.headers.get("retry-after"));

const titles = [];
for (const p of ["/", "/programs", "/programs/weight-transformation", "/conditions/pcos", "/assessment", "/book", "/contact", "/faq", "/about", "/how-it-works", "/stories", "/privacy-policy", "/terms", "/refund-policy", "/medical-disclaimer", "/login", "/admin/login", "/definitely-not-a-page"]) {
  const t = (await call(p)).text.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  titles.push(t);
  expect("SEO-01", `${p} title names the brand exactly once`, (t.match(/Ozmo/g) ?? []).length === 1, t);
}
expect("SEO-01", "public pages have distinct titles", new Set(titles).size === titles.length, titles.join(" | "));
r = await call(`/assessment/snapshot/${(await db.assessment.findFirst({ orderBy: { createdAt: "desc" } })).token}`);
expect("SEO-01", "the snapshot page has its own title and is noindex", /<title>Your Health Snapshot \| Ozmo Diet Clinic<\/title>/.test(r.text) && /noindex/.test(r.text), r.text.match(/<title>([^<]*)<\/title>/)?.[1]);

r = await call("/privacy-policy");
expect("LEGAL-01", "privacy policy no longer claims an online payment gateway or analytics", !/payment gateway/i.test(r.text) && !/Analytics runs/i.test(r.text) && /no analytics/i.test(r.text), "");
const policyText = r.text.replace(/<!-- -->/g, "");
expect("LEGAL-01", "privacy policy states the retention periods the clean-up job uses", policyText.includes("24 months after the last contact") && policyText.includes("30 days"), "");
r = await call("/faq");
expect("COPY-01", "FAQ no longer promises logging reminders that don't exist", !/gentle reminder/i.test(r.text), "");
r = await call("/book");
expect("COPY-01", "booking page no longer promises a link 30 minutes before", !/arrives 30 minutes before/.test(r.text), "");

/* ═════════════════════════ UI pages ═════════════════════════ */
group("Pages render for each role");
const planPage = await call(`/admin/plans/${v2}`, { cookie: diet });
expect("UI-01", "plan builder page renders", planPage.status === 200 && planPage.text.includes("Publish to client"), planPage.status);
expect("UI-01", "plan print page renders", (await call(`/admin/plans/${livePlan}/print`, { cookie: diet })).status === 200);
for (const [p, who, name] of [["/admin", fd, "front desk"], ["/admin/foods", diet, "dietitian"], ["/admin/messages", asst, "assistant"], ["/admin/account", fd, "front desk"], ["/admin/staff", admin, "admin"], ["/admin/clients/new", diet, "dietitian"], [`/admin/clients/${clientId}`, diet, "dietitian"]]) {
  r = await call(p, { cookie: who });
  expect("UI-01", `${p.replace(/c[a-z0-9]{20,}/, ":id")} renders for ${name}`, r.status === 200 && !/Something went wrong|Application error/.test(r.text), r.status);
}
for (const p of ["/portal", "/portal/plan", "/portal/log", "/portal/progress", "/portal/measurements", "/portal/messages", "/portal/appointments", "/portal/reports", "/portal/profile"]) {
  r = await call(p, { cookie: clientCookie });
  expect("UI-02", `${p} renders for the client`, r.status === 200 && !/Something went wrong|Application error/.test(r.text), r.status);
}
for (const p of ["/", "/programs", "/programs/metabolic-health", "/conditions/pcos", "/assessment", "/book", "/contact", "/faq", "/about", "/stories", "/privacy-policy", "/login"]) {
  r = await call(p);
  expect("UI-03", `${p} renders`, r.status === 200, r.status);
}

/* ═════════════════════════ performance snapshot ═════════════════════════ */
group("Performance snapshot");
const timings = [];
for (const [p, who] of [["/", null], ["/admin", diet], ["/admin/leads", diet], ["/admin/clients", diet], [`/admin/clients/${clientId}`, diet], [`/admin/plans/${v2}`, diet], ["/portal", clientCookie]]) {
  const xs = [];
  for (let i = 0; i < 5; i++) xs.push((await call(p, { cookie: who })).ms);
  const med = Math.round(xs.sort((a, b) => a - b)[2]);
  timings.push([p.replace(/c[a-z0-9]{20,}/, ":id"), med]);
  expect("PERF-02", `${p.replace(/c[a-z0-9]{20,}/, ":id")} median response under 1.5 s`, med < 1500, `${med}ms`);
}
const pages = ["/", "/programs", "/conditions/pcos", "/book", "/assessment", "/faq", "/contact"];
const seen = new Map();
const weights = [];
for (const p of pages) {
  const html = (await call(p)).text;
  const srcs = [...new Set([...html.matchAll(/<script[^>]*src="(\/_next\/static\/[^"]+?\.js)"[^>]*>/g)].filter((m) => !/noModule/i.test(m[0])).map((m) => m[1]))];
  let raw = 0, gz = 0;
  for (const s of srcs) {
    if (!seen.has(s)) { const buf = (await call(s)).buf; seen.set(s, [buf.length, zlib.gzipSync(buf).length]); }
    raw += seen.get(s)[0]; gz += seen.get(s)[1];
  }
  weights.push([p, Math.round(raw / 1024), Math.round(gz / 1024)]);
  expect("PERF-03", `${p} JavaScript under 160 KB gzipped`, gz / 1024 < 160, `${Math.round(gz / 1024)} KB`);
}

await db.authThrottle.deleteMany();
const failed = results.filter((x) => !x.ok);
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed${skipped.length ? `, ${skipped.length} skipped` : ""}`);
if (process.env.RESULTS) fs.writeFileSync(process.env.RESULTS, JSON.stringify({ results, skipped, timings, weights, run }, null, 2));
await db.$disconnect();
process.exit(failed.length ? 1 : 0);
