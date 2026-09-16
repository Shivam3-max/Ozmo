import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { clientIp, limitedFor, recordHit } from "@/lib/rate-limit";
import { lockedFor, recordFailedLogin, clearFailedLogins } from "@/lib/auth-throttle";
import { verifyPassword } from "@/lib/password";
import { normalizePhone } from "@/lib/phone";
import { auditAuth, type FailureReason } from "@/lib/security-audit";
import { apiHandler } from "@/lib/api";

export const runtime = "nodejs";

const IP_FAILURES = 20;
const IP_WINDOW_MS = 15 * 60 * 1000;

const schema = z.object({
  identifier: z.string().trim().min(3, "Enter your phone or email").max(200),
  password: z.string().min(1, "Enter your password").max(200),
});

const tooMany = (retryAfter: number) =>
  NextResponse.json(
    { error: `Too many attempts. Try again in ${Math.max(1, Math.ceil(retryAfter / 60))} min.` },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );

export const POST = apiHandler(async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const ipKey = ip ? `clientlogin-fail:${ip}` : null;
  const ipWait = ipKey ? await limitedFor(ipKey, IP_FAILURES) : 0;
  if (ipWait) return tooMany(ipWait);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter your details." }, { status: 422 });

  // "98888 77777" and "+91 98888-77777" are the same person: match and throttle
  // on one canonical form.
  const raw = parsed.data.identifier.trim();
  const phone = raw.includes("@") ? null : normalizePhone(raw);
  const identifier = phone ?? raw.toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      role: "CLIENT",
      deletedAt: null,
      OR: phone ? [{ phone }, { phone: raw }] : [{ email: identifier }],
    },
  });

  const accountWait = await lockedFor("client", identifier);
  if (accountWait) {
    await auditAuth({ action: "LOGIN_BLOCKED", scope: "client", identifier, user, ip });
    return tooMany(accountWait);
  }

  // Same message and a full bcrypt comparison either way, so this can't be used
  // to find out who is a client of the clinic.
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash);

  const reason: FailureReason | null =
    !user ? "unknown_account"
    : !user.passwordHash ? "no_password_yet"
    : !ok ? "wrong_password"
    : !user.isActive ? "inactive"
    : null;

  if (reason || !user) {
    const lockedMinutes = await recordFailedLogin("client", identifier);
    if (ipKey) await recordHit(ipKey, IP_WINDOW_MS);
    await auditAuth({ action: "LOGIN_FAILED", scope: "client", identifier, user, ip, reason: reason ?? "unknown_account" });
    if (lockedMinutes) await auditAuth({ action: "ACCOUNT_LOCKED", scope: "client", identifier, user, ip, lockedMinutes });
    return NextResponse.json({ error: "Those details don't match." }, { status: 401 });
  }

  await clearFailedLogins("client", identifier);
  await createSession({
    sub: user.id, name: user.name, email: user.email,
    role: "CLIENT", clinicId: user.clinicId, sessionVersion: user.sessionVersion,
  });
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await auditAuth({ action: "LOGIN_SUCCEEDED", scope: "client", identifier, user, ip });

  return NextResponse.json({ ok: true });
});
