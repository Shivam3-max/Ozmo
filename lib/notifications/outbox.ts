import type { NotificationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { errorFingerprint } from "@/lib/observability";
import { conflict, notFound } from "@/lib/errors";
import type { Db } from "@/lib/services/audit";
import { emailConfigured, isDeliverableEmail, sendEmail } from "@/lib/notifications/mailer";
import type { Email } from "@/lib/notifications/templates";

/**
 * Emails carrying a one-time password link. Their body is wiped once sent, and
 * they are never re-sent from the outbox — a newer link may have replaced it,
 * so staff issue a fresh one instead.
 */
export const LINK_KINDS = ["PORTAL_INVITE", "PORTAL_RESET", "STAFF_INVITE", "STAFF_RESET"];
export const REDACTED_BODY = "[Removed after sending: this email contained a one-time sign-in link.]";

export type Outgoing = {
  clinicId: string;
  kind: string;
  to: string | null | undefined;
  email: Email;
  related?: { type: string; id: string };
  createdById?: string | null;
};

/**
 * Records a notification. Call inside the transaction that caused it, then
 * `deliver()` the returned id after the transaction commits — so an email is
 * never sent for a change that rolled back, and every attempt is on record.
 * Returns null when there's no real address to send to.
 */
export async function queue(db: Db, n: Outgoing) {
  if (!isDeliverableEmail(n.to)) return null;
  const row = await db.notification.create({
    data: {
      clinicId: n.clinicId,
      kind: n.kind,
      recipient: n.to,
      subject: n.email.subject.slice(0, 255),
      body: n.email.text,
      relatedType: n.related?.type,
      relatedId: n.related?.id,
      createdById: n.createdById ?? null,
    },
    select: { id: true },
  });
  return row.id;
}

/** Tries to send queued notifications. Never throws: the outcome is stored on the row. */
export async function deliver(ids: (string | null | undefined)[]): Promise<Record<string, NotificationStatus>> {
  const results: Record<string, NotificationStatus> = {};
  for (const id of ids.filter((x): x is string => Boolean(x))) {
    const n = await prisma.notification.findUnique({ where: { id } });
    if (!n || n.status === "SENT") {
      if (n) results[id] = n.status;
      continue;
    }
    // Whatever the outcome, a one-time link doesn't stay readable in the outbox.
    const scrub = LINK_KINDS.includes(n.kind) ? { body: REDACTED_BODY } : {};
    if (!emailConfigured()) {
      await prisma.notification.update({ where: { id }, data: { status: "SKIPPED", lastError: "Email sending isn't set up (SMTP_HOST / EMAIL_FROM).", ...scrub } });
      results[id] = "SKIPPED";
      continue;
    }
    try {
      await sendEmail({ to: n.recipient, subject: n.subject, text: n.body });
      await prisma.notification.update({ where: { id }, data: { status: "SENT", sentAt: new Date(), attempts: { increment: 1 }, lastError: null, ...scrub } });
      results[id] = "SENT";
    } catch (err) {
      const f = errorFingerprint(err) as { name: string; code?: string };
      await prisma.notification.update({
        where: { id },
        data: { status: "FAILED", attempts: { increment: 1 }, lastError: `${f.name}${f.code ? ` ${f.code}` : ""}`.slice(0, 500), ...scrub },
      });
      results[id] = "FAILED";
    }
  }
  return results;
}

/** Staff re-send a failed or skipped email — e.g. after email sending was set up. */
export async function retryNotification(clinicId: string, id: string) {
  const n = await prisma.notification.findFirst({ where: { id, clinicId } });
  if (!n) throw notFound("Notification");
  if (n.status === "SENT") throw conflict("That email has already been sent.");
  if (LINK_KINDS.includes(n.kind)) throw conflict("Password links aren't re-sent. Issue a new link from the client or staff page.");
  return (await deliver([id]))[id];
}

/** Queue and deliver in one step, for messages not tied to a database change. */
export async function notifyNow(n: Outgoing) {
  const id = await queue(prisma, n);
  if (!id) return "NO_ADDRESS" as const;
  return (await deliver([id]))[id];
}

/** Where alerts about new website submissions go. Unset = no alert email. */
export const clinicInbox = () => process.env.CLINIC_NOTIFY_EMAIL?.trim() || null;

/** Absolute link for emails, built from the canonical site URL. */
export { absoluteUrl as siteLink } from "@/lib/site";
