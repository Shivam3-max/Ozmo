import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ServiceError } from "@/lib/errors";
import { can, isStaffRole, scopeFor, type Action, type Role } from "@/lib/policy";

/**
 * Staff and clients get separate cookies, so a staff member who opens a client
 * setup link (or tests the portal) in the same browser isn't signed out of the
 * practice area, and neither session can stand in for the other.
 */
export type SessionScope = "staff" | "client";
export const SESSION_COOKIES: Record<SessionScope, string> = { staff: "ozmo_staff", client: "ozmo_client" };
const LEGACY_COOKIE = "ozmo_session";

const MAX_AGE_SECONDS = 8 * 60 * 60; // sessions are keys to health records — 8 hours, not 30 days
export const MIN_SECRET_LENGTH = 32;

export type SessionUser = {
  sub: string;
  name: string;
  email: string;
  role: Role;
  clinicId: string;
  sessionVersion: number;
  /** This sign-in's id, so signing out ends this device only. Absent on tokens issued before it existed. */
  sid?: string;
  /** Expiry, seconds since the epoch (set by the JWT). */
  exp?: number;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < MIN_SECRET_LENGTH) {
    throw new Error(`AUTH_SECRET is missing or too short — set a ${MIN_SECRET_LENGTH}+ character secret.`);
  }
  return new TextEncoder().encode(value);
}

export const scopeOfRole = (role: Role): SessionScope => (role === "CLIENT" ? "client" : "staff");

export async function createSession(user: SessionUser) {
  // Only the identity fields — never copy claims (iat/exp/sid) from an older token.
  const claims = {
    sub: user.sub, name: user.name, email: user.email, role: user.role,
    clinicId: user.clinicId, sessionVersion: user.sessionVersion,
    sid: randomBytes(18).toString("base64url"),
  };
  const token = await new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());

  const jar = await cookies();
  jar.set(SESSION_COOKIES[scopeOfRole(user.role)], token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  jar.delete(LEGACY_COOKIE);
}

export async function destroySession(scope?: SessionScope) {
  const jar = await cookies();
  for (const s of scope ? [scope] : (["staff", "client"] as const)) jar.delete(SESSION_COOKIES[s]);
  jar.delete(LEGACY_COOKIE);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || !payload.role) return null;
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

/**
 * The signed-in person for a scope, revalidated against the database on every
 * call: a disabled, deleted, re-roled or signed-out user loses access at once.
 */
export async function getSession(scope: SessionScope): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIES[scope])?.value;
  const session = token ? await verifyToken(token) : null;
  if (!session || scopeOfRole(session.role) !== scope) return null;
  const [user, revoked] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      select: { isActive: true, role: true, clinicId: true, sessionVersion: true, deletedAt: true },
    }),
    session.sid ? prisma.revokedSession.findUnique({ where: { sid: session.sid }, select: { sid: true } }) : null,
  ]);
  if (!user || revoked || !user.isActive || user.deletedAt || user.role !== session.role ||
      user.clinicId !== session.clinicId || user.sessionVersion !== session.sessionVersion) return null;
  return session;
}

/**
 * Ends one sign-in: the token is rejected from now until it would have expired.
 * Tokens from before session ids existed can only be ended everywhere.
 */
export async function revokeSession(session: SessionUser) {
  if (!session.sid) return signOutEverywhere(session.sub);
  const expiresAt = new Date((session.exp ?? Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS) * 1000);
  await prisma.revokedSession.upsert({
    where: { sid: session.sid },
    create: { sid: session.sid, userId: session.sub, expiresAt },
    update: {},
  });
}

/** Ends every sign-in for this person, on every device. */
export async function signOutEverywhere(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { sessionVersion: { increment: 1 } } });
}

/**
 * API guard: the session for this action, or a 401 (not signed in) / 403 (signed
 * in, but the role doesn't allow it). Thrown errors become JSON via lib/api.ts.
 */
export async function authorize(action: Action): Promise<SessionUser> {
  const session = await getSession(scopeFor(action));
  if (!session) throw new ServiceError(401, "Not signed in.");
  if (!can(session.role, action)) throw new ServiceError(403, "Your role doesn't allow this.");
  return session;
}

/** Page guard for the practice area. The proxy checks too, but never rely on it alone. */
export async function requireStaff(): Promise<SessionUser> {
  const session = await getSession("staff");
  if (!session || !isStaffRole(session.role)) redirect("/admin/login");
  return session;
}

/** Page guard for the client portal. */
export async function requireClient(): Promise<SessionUser> {
  const session = await getSession("client");
  if (!session || session.role !== "CLIENT") redirect("/login");
  return session;
}
