import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { clientIp, limitedFor, recordHit } from "@/lib/rate-limit";
import { lockedFor, recordFailedLogin, clearFailedLogins } from "@/lib/auth-throttle";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";
import { isStaffRole } from "@/lib/policy";
import { auditAuth, type FailureReason } from "@/lib/security-audit";
import { apiHandler } from "@/lib/api";

export const runtime = "nodejs";

const IP_FAILURES = 20;
const IP_WINDOW_MS = 15 * 60 * 1000;

const tooMany = (retryAfter: number) =>
  NextResponse.json(
    { error: `Too many sign-in attempts. Try again in ${Math.max(1, Math.ceil(retryAfter / 60))} min.` },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );

export const POST = apiHandler(async function POST(req: Request) {
  // Only failures count, and an unknown address is never used as a shared key —
  // otherwise one person could lock the whole clinic out.
  const ip = clientIp(req.headers);
  const ipKey = ip ? `login-fail:${ip}` : null;
  const ipWait = ipKey ? await limitedFor(ipKey, IP_FAILURES) : 0;
  if (ipWait) return tooMany(ipWait);

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 422 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  const accountWait = await lockedFor("staff", email);
  if (accountWait) {
    await auditAuth({ action: "LOGIN_BLOCKED", scope: "staff", identifier: email, user, ip });
    return tooMany(accountWait);
  }

  // verifyPassword always does a full bcrypt comparison, so a missing account
  // takes as long as a wrong password and the form can't enumerate staff.
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash);

  const reason: FailureReason | null =
    !user ? "unknown_account"
    : !user.passwordHash ? "no_password_yet"
    : !ok ? "wrong_password"
    : !user.isActive || user.deletedAt ? "inactive"
    : !isStaffRole(user.role) ? "not_staff"
    : null;

  if (reason || !user) {
    const lockedMinutes = await recordFailedLogin("staff", email);
    if (ipKey) await recordHit(ipKey, IP_WINDOW_MS);
    await auditAuth({ action: "LOGIN_FAILED", scope: "staff", identifier: email, user, ip, reason: reason ?? "unknown_account" });
    if (lockedMinutes) await auditAuth({ action: "ACCOUNT_LOCKED", scope: "staff", identifier: email, user, ip, lockedMinutes });
    return NextResponse.json({ error: "That email and password don't match." }, { status: 401 });
  }

  await clearFailedLogins("staff", email);
  await createSession({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    clinicId: user.clinicId,
    sessionVersion: user.sessionVersion,
  });
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await auditAuth({ action: "LOGIN_SUCCEEDED", scope: "staff", identifier: email, user, ip });

  return NextResponse.json({ ok: true });
});
