import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";

/** Failures allowed before an account starts locking. */
export const FREE_ATTEMPTS = 5;
const MAX_LOCK_MINUTES = 60;
const FORGET_AFTER_MS = 24 * 60 * 60 * 1000;

export type ThrottleScope = "staff" | "client";

/** 5th failure locks for 1 minute, then 2, 4, 8… capped at an hour per failure. */
export function lockoutMinutes(failures: number) {
  if (failures < FREE_ATTEMPTS) return 0;
  return Math.min(MAX_LOCK_MINUTES, 2 ** (failures - FREE_ATTEMPTS));
}

/** Hashed so the key fits the column and the table never stores login identifiers. */
export function throttleKey(scope: ThrottleScope, identifier: string) {
  return createHash("sha256").update(`${scope}:${identifier.trim().toLowerCase()}`).digest("hex");
}

/** Seconds until this identifier may try again, or 0 if it isn't locked. */
export async function lockedFor(scope: ThrottleScope, identifier: string) {
  const row = await prisma.authThrottle.findUnique({ where: { key: throttleKey(scope, identifier) } });
  if (!row?.lockedUntil) return 0;
  return Math.max(0, Math.ceil((row.lockedUntil.getTime() - Date.now()) / 1000));
}

/** Records a failure; returns the lock length in minutes this failure triggered (0 if none). */
export async function recordFailedLogin(scope: ThrottleScope, identifier: string) {
  const key = throttleKey(scope, identifier);
  const now = new Date();

  // A day without failures and no active lock starts the count again.
  await prisma.authThrottle.deleteMany({
    where: {
      key,
      updatedAt: { lt: new Date(now.getTime() - FORGET_AFTER_MS) },
      OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }],
    },
  });

  const row = await prisma.authThrottle.upsert({
    where: { key },
    create: { key, failures: 1 },
    update: { failures: { increment: 1 } },
  });

  const minutes = lockoutMinutes(row.failures);
  if (minutes > 0) {
    await prisma.authThrottle.update({
      where: { key },
      data: { lockedUntil: new Date(now.getTime() + minutes * 60_000) },
    });
  }

  // Occasional sweep so guesses at made-up identifiers don't accumulate forever.
  if (Math.random() < 0.01) {
    await prisma.authThrottle.deleteMany({
      where: { updatedAt: { lt: new Date(now.getTime() - 7 * FORGET_AFTER_MS) } },
    });
  }
  return minutes;
}

export async function clearFailedLogins(scope: ThrottleScope, identifier: string) {
  await prisma.authThrottle.deleteMany({ where: { key: throttleKey(scope, identifier) } });
}
