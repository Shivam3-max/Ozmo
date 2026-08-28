import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

export const CLINIC_ID = "ozmo";
export const POLICY_VERSION = "2026-08-28";

export const snapshotToken = () => randomBytes(18).toString("base64url");

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

export async function logLeadActivity(leadId: string, type: string, note?: string, staffId?: string) {
  return prisma.leadActivity.create({ data: { leadId, type, note, staffId } });
}

/** Fire-and-forget clinic notification. Swap for email/WhatsApp in Phase 4. */
export async function notifyClinic(subject: string, body: string) {
  // Deliberately just a log for now — no mail provider is configured yet, and a
  // silently failing send would be worse than an obvious one. Wire Resend here.
  console.log(`[ozmo:notify] ${subject}\n${body}`);
}
