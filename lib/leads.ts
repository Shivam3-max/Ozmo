import { randomBytes } from "node:crypto";
import type { prisma } from "@/lib/db";
import { CLINIC_ID } from "@/lib/clinic";

export const POLICY_VERSION = "2026-08-28";

export const snapshotToken = () => randomBytes(18).toString("base64url");

/**
 * Unique key that stops two live bookings sharing a time. Only SCHEDULED
 * appointments hold one; it is cleared when an appointment is cancelled,
 * completed or marked no-show so the time can be booked again.
 */
export const slotKeyFor = (scheduledAt: Date) => `${CLINIC_ID}:${scheduledAt.toISOString()}`;

/**
 * Lead score, 0–100. Readiness dominates because it predicts conversion far
 * better than anything else in the assessment; condition complexity and goal
 * clarity break the ties. Section 09 of the docs has the reasoning.
 */
export function scoreLead(opts: {
  readiness: number;
  conditionCount: number;
  hasGoal: boolean;
  hasReports: boolean;
}) {
  const readiness = Math.max(0, Math.min(5, opts.readiness));
  let score = readiness * 14; // 0–70
  if (opts.hasGoal) score += 10;
  if (opts.conditionCount > 0) score += 10;
  if (opts.hasReports) score += 10;
  return Math.min(100, score);
}

type Tx = Pick<typeof prisma, "lead" | "leadActivity">;

/**
 * The first lead already holding this phone, if any. Used only to flag a
 * possible duplicate — a phone number is not proof of identity.
 */
export function earlierLeadWithPhone(tx: Tx, phone: string) {
  return tx.lead.findFirst({
    where: { clinicId: CLINIC_ID, phone, duplicateOfLeadId: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
}

/** Notes on the earlier lead that a new submission used its phone number. */
export function flagPossibleDuplicate(tx: Tx, earlierLeadId: string, created: { name: string }, via: "assessment" | "booking") {
  return tx.leadActivity.create({
    data: {
      leadId: earlierLeadId,
      type: "POSSIBLE_DUPLICATE",
      note: `A new ${via} from "${created.name}" used this phone number. It was saved as a separate lead; nothing here was changed.`,
    },
  });
}
