import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, getSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { passwordProblem, PASSWORD_MAX, PASSWORD_MIN, STAFF_PASSWORD_MIN } from "@/lib/password-policy";
import { lockedFor, recordFailedLogin, clearFailedLogins } from "@/lib/auth-throttle";
import { clientIp } from "@/lib/rate-limit";
import { apiHandler } from "@/lib/api";

export const runtime = "nodejs";

const schema = z.object({
  /** Which signed-in account: the practice area and portal have separate sessions. */
  scope: z.enum(["staff", "client"]),
  currentPassword: z.string().min(1, "Enter your current password").max(PASSWORD_MAX),
  newPassword: z.string().max(PASSWORD_MAX),
});

/**
 * Signed-in password change for staff and clients. Other devices are signed
 * out; this one stays signed in with a fresh session.
 */
export const POST = apiHandler(async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 422 });
  }

  const scope = parsed.data.scope;
  const session = await getSession(scope);
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  // Keyed on the account, so a stolen session can't be used to guess the password quickly.
  const throttleId = `password-change:${session.sub}`;
  const wait = await lockedFor(scope, throttleId);
  if (wait) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.max(1, Math.ceil(wait / 60))} min.` },
      { status: 429, headers: { "Retry-After": String(wait) } }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!ok) {
    await recordFailedLogin(scope, throttleId);
    await prisma.auditLog.create({
      data: { clinicId: user.clinicId, actorId: user.id, action: "PASSWORD_CHANGE_FAILED", entityType: "User", entityId: user.id, ipAddress: clientIp(req.headers) },
    });
    return NextResponse.json({ error: "Your current password isn't right." }, { status: 422 });
  }

  const minLength = scope === "staff" ? STAFF_PASSWORD_MIN : PASSWORD_MIN;
  const weak = passwordProblem(parsed.data.newPassword, { name: user.name, email: user.email, phone: user.phone }, minLength);
  if (weak) return NextResponse.json({ error: weak }, { status: 422 });
  if (await verifyPassword(parsed.data.newPassword, user.passwordHash)) {
    return NextResponse.json({ error: "Choose a password different from your current one." }, { status: 422 });
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.user.update({
      where: { id: user.id },
      data: { passwordHash, inviteToken: null, inviteExpiresAt: null, sessionVersion: { increment: 1 } },
    });
    await tx.auditLog.create({
      data: { clinicId: user.clinicId, actorId: user.id, action: "PASSWORD_CHANGED", entityType: "User", entityId: user.id, ipAddress: clientIp(req.headers) },
    });
    return row;
  });

  await clearFailedLogins(scope, throttleId);
  await createSession({ ...session, sessionVersion: updated.sessionVersion });

  return NextResponse.json({ ok: true });
});
