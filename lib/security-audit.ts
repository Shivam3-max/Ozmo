import { prisma } from "@/lib/db";
import { CLINIC_ID } from "@/lib/clinic";
import { throttleKey, type ThrottleScope } from "@/lib/auth-throttle";

export const AUTH_EVENTS = ["LOGIN_SUCCEEDED", "LOGIN_FAILED", "LOGIN_BLOCKED", "ACCOUNT_LOCKED", "LOGOUT", "LOGOUT_EVERYWHERE"] as const;
export type AuthEvent = (typeof AUTH_EVENTS)[number];

export type FailureReason = "unknown_account" | "wrong_password" | "no_password_yet" | "inactive" | "not_staff";

/**
 * Sign-in history for the administrator's weekly review. Unknown accounts are
 * recorded against a hash of the identifier, never the typed email or phone,
 * so a mistyped password can't end up in the log.
 */
export async function auditAuth(event: {
  action: AuthEvent;
  scope: ThrottleScope;
  identifier: string;
  user?: { id: string; clinicId: string } | null;
  ip: string | null;
  reason?: FailureReason;
  lockedMinutes?: number;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        clinicId: event.user?.clinicId ?? CLINIC_ID,
        actorId: event.user?.id ?? null,
        action: event.action,
        entityType: event.user ? "User" : "LoginIdentifier",
        entityId: event.user?.id ?? throttleKey(event.scope, event.identifier).slice(0, 32),
        ipAddress: event.ip,
        changes: {
          scope: event.scope,
          ...(event.reason ? { reason: event.reason } : {}),
          ...(event.lockedMinutes ? { lockedMinutes: event.lockedMinutes } : {}),
        },
      },
    });
  } catch {
    // An audit write must never be the reason someone can't sign in.
  }
}
