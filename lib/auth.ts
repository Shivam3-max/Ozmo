import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "ozmo_session";
const MAX_AGE_SECONDS = 8 * 60 * 60; // staff sessions are keys to health records — 8 hours, not 30 days

export type SessionUser = {
  sub: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "DIETITIAN" | "ASSISTANT" | "FRONT_DESK" | "CLIENT";
  clinicId: string;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 24) {
    throw new Error("AUTH_SECRET is missing or too short — set a 32+ character secret.");
  }
  return new TextEncoder().encode(value);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
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

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

const STAFF_ROLES = ["SUPER_ADMIN", "DIETITIAN", "ASSISTANT", "FRONT_DESK"] as const;

export function isStaff(role?: string): boolean {
  return STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number]);
}

/** Page-level guard. Middleware also checks, but never rely on it alone. */
export async function requireStaff(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || !isStaff(session.role)) redirect("/admin/login");
  return session;
}

/**
 * Front desk deliberately cannot see health data — name, phone, appointment and
 * payment status only. Checked here rather than hidden in the UI.
 */
export function canSeeHealthData(role: string) {
  return role === "SUPER_ADMIN" || role === "DIETITIAN" || role === "ASSISTANT";
}

export function canEditPlans(role: string) {
  return role === "SUPER_ADMIN" || role === "DIETITIAN";
}

/** Portal guard. Middleware checks too, but never rely on it alone. */
export async function requireClient(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") redirect("/login");
  return session;
}
