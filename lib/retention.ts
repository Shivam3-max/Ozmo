import { prisma } from "@/lib/db";
import { REDACTED_BODY } from "@/lib/notifications/outbox";

/**
 * How long Ozmo keeps data nobody needs any more. These are engineering
 * defaults, NOT legal advice: the clinic's adviser must confirm them against
 * the DPDP Act, medical-record and tax rules, and the privacy policy wording
 * before launch. Client health records are never removed here — only on a
 * deletion request (lib/services/erasure.ts).
 */
export const LEGAL_REVIEW_REQUIRED = true;

export const RETENTION = {
  /** Leads that never became clients and haven't been touched. Assessment answers go with them. */
  unconvertedLeadMonths: 24,
  /** Website enquiries already marked handled. */
  handledEnquiryMonths: 24,
  /** Email text is kept briefly for retries, then wiped; the delivery record stays longer. */
  notificationBodyDays: 30,
  notificationRecordMonths: 12,
  /** Sign-in throttle counters that are no longer locking anyone out. */
  throttleDays: 30,
} as const;

const DAY = 24 * 60 * 60 * 1000;
const monthsAgo = (months: number, now: Date) => new Date(now.getTime() - months * 30 * DAY);
const daysAgo = (days: number, now: Date) => new Date(now.getTime() - days * DAY);

export type RetentionReport = { label: string; rule: string; count: number }[];

function rules(now: Date) {
  const leadCutoff = monthsAgo(RETENTION.unconvertedLeadMonths, now);
  return {
    leads: {
      label: "Unconverted leads (with their assessment and activity)",
      rule: `No client created and untouched for ${RETENTION.unconvertedLeadMonths} months`,
      where: { convertedClientId: null, updatedAt: { lt: leadCutoff }, stage: { not: "CONVERTED" as const }, appointments: { none: { scheduledAt: { gte: leadCutoff } } } },
    },
    enquiries: {
      label: "Handled website enquiries",
      rule: `Marked handled more than ${RETENTION.handledEnquiryMonths} months ago`,
      where: { handledAt: { lt: monthsAgo(RETENTION.handledEnquiryMonths, now) } },
    },
    notificationBodies: {
      label: "Email text in the outbox",
      rule: `Older than ${RETENTION.notificationBodyDays} days (the delivery record is kept)`,
      where: { createdAt: { lt: daysAgo(RETENTION.notificationBodyDays, now) }, body: { not: REDACTED_BODY } },
    },
    notifications: {
      label: "Email delivery records",
      rule: `Older than ${RETENTION.notificationRecordMonths} months`,
      where: { createdAt: { lt: monthsAgo(RETENTION.notificationRecordMonths, now) } },
    },
    // Pure housekeeping — no personal data, nothing for legal review.
    housekeeping: {
      label: "Expired rate-limit counters and signed-out sessions",
      rule: "Past their expiry",
    },
    throttle: {
      label: "Sign-in throttle counters",
      rule: `Not updated for ${RETENTION.throttleDays} days and not locking anyone out`,
      where: { updatedAt: { lt: daysAgo(RETENTION.throttleDays, now) }, OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }] },
    },
  };
}

/** Counts what a retention run would remove, without changing anything. */
export async function retentionPreview(clinicId: string, now = new Date()): Promise<RetentionReport> {
  const r = rules(now);
  const [leads, enquiries, bodies, notifications, throttle, buckets, revoked] = await Promise.all([
    prisma.lead.count({ where: { clinicId, ...r.leads.where } }),
    prisma.contactMessage.count({ where: { clinicId, ...r.enquiries.where } }),
    prisma.notification.count({ where: { clinicId, ...r.notificationBodies.where } }),
    prisma.notification.count({ where: { clinicId, ...r.notifications.where } }),
    prisma.authThrottle.count({ where: r.throttle.where }),
    prisma.rateLimitBucket.count({ where: { resetAt: { lt: now } } }),
    prisma.revokedSession.count({ where: { expiresAt: { lt: now } } }),
  ]);
  return [
    { label: r.leads.label, rule: r.leads.rule, count: leads },
    { label: r.enquiries.label, rule: r.enquiries.rule, count: enquiries },
    { label: r.notificationBodies.label, rule: r.notificationBodies.rule, count: bodies },
    { label: r.notifications.label, rule: r.notifications.rule, count: notifications },
    { label: r.throttle.label, rule: r.throttle.rule, count: throttle },
    { label: r.housekeeping.label, rule: r.housekeeping.rule, count: buckets + revoked },
  ];
}

/** Applies the retention rules. Returns what was removed; the caller records it in the audit log. */
export async function runRetention(clinicId: string, now = new Date()): Promise<RetentionReport> {
  const r = rules(now);
  const leadIds = (await prisma.lead.findMany({ where: { clinicId, ...r.leads.where }, select: { id: true } })).map((l) => l.id);

  const result = await prisma.$transaction(async (tx) => {
    let leads = 0;
    if (leadIds.length) {
      await tx.lead.updateMany({ where: { duplicateOfLeadId: { in: leadIds } }, data: { duplicateOfLeadId: null } });
      await tx.consultationNote.deleteMany({ where: { appointment: { leadId: { in: leadIds } } } });
      await tx.appointment.deleteMany({ where: { leadId: { in: leadIds }, clientId: null } });
      leads = (await tx.lead.deleteMany({ where: { id: { in: leadIds } } })).count; // assessment and activities cascade
    }
    const enquiries = (await tx.contactMessage.deleteMany({ where: { clinicId, ...r.enquiries.where } })).count;
    const bodies = (await tx.notification.updateMany({ where: { clinicId, ...r.notificationBodies.where }, data: { body: REDACTED_BODY } })).count;
    const notifications = (await tx.notification.deleteMany({ where: { clinicId, ...r.notifications.where } })).count;
    const throttle = (await tx.authThrottle.deleteMany({ where: r.throttle.where })).count;
    const housekeeping =
      (await tx.rateLimitBucket.deleteMany({ where: { resetAt: { lt: now } } })).count +
      (await tx.revokedSession.deleteMany({ where: { expiresAt: { lt: now } } })).count;
    return { leads, enquiries, bodies, notifications, throttle, housekeeping };
  }, { timeout: 60_000 });

  return [
    { label: r.leads.label, rule: r.leads.rule, count: result.leads },
    { label: r.enquiries.label, rule: r.enquiries.rule, count: result.enquiries },
    { label: r.notificationBodies.label, rule: r.notificationBodies.rule, count: result.bodies },
    { label: r.notifications.label, rule: r.notifications.rule, count: result.notifications },
    { label: r.throttle.label, rule: r.throttle.rule, count: result.throttle },
    { label: r.housekeeping.label, rule: r.housekeeping.rule, count: result.housekeeping },
  ];
}
