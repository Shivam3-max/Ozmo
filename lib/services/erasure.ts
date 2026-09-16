import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { conflict, invalid, notFound } from "@/lib/errors";
import { audit, type Actor, type Db } from "@/lib/services/audit";

/**
 * Erasing a client on request. Health and personal data is deleted; the client
 * row stays as an anonymous tombstone (code only) so appointments, programme
 * payments and the audit trail still add up. What is retained, and why:
 *
 *  - Enrollment rows (programme, dates, price paid): accounting records.
 *  - Appointment rows with reason, notes and video link removed: the diary.
 *  - Audit log entries: they hold record ids and field names, never content.
 *
 * The retention periods behind those choices need confirming by the clinic's
 * legal adviser before launch — see lib/retention.ts.
 */
export const RETAINED_AFTER_ERASURE = [
  "Programme enrolment and amount paid (accounting)",
  "Appointment dates and status, without reasons, notes or links",
  "Audit log entries (record ids only)",
];

async function scope(db: Db, clinicId: string, clientId: string) {
  const client = await db.client.findFirst({
    where: { id: clientId, clinicId },
    include: { user: { select: { id: true, email: true, phone: true } } },
  });
  if (!client) throw notFound("Client");
  const leads = await db.lead.findMany({
    where: { clinicId, OR: [{ convertedClientId: clientId }, { assessment: { clientId } }] },
    select: { id: true },
  });
  const contacts = [client.user.phone, client.user.email].filter((v): v is string => Boolean(v));
  return { client, leadIds: leads.map((l) => l.id), contacts };
}

async function counts(db: Db, clinicId: string, clientId: string) {
  const { client, leadIds, contacts } = await scope(db, clinicId, clientId);
  const where = { clientId };
  const [healthProfiles, measurements, foodLogs, waterLogs, plans, reports, documents, messages, consultNotes, enquiries, notifications] = await Promise.all([
    db.healthProfile.count({ where }),
    db.measurement.count({ where }),
    db.foodLog.count({ where }),
    db.waterLog.count({ where }),
    db.dietPlan.count({ where }),
    db.progressReport.count({ where }),
    db.document.count({ where }),
    db.message.count({ where: { thread: { clientId } } }),
    db.consultationNote.count({ where: { appointment: { OR: [{ clientId }, { leadId: { in: leadIds } }] } } }),
    db.contactMessage.count({ where: { clinicId, OR: [{ phone: { in: contacts } }, { email: { in: contacts } }] } }),
    db.notification.count({ where: { clinicId, recipient: client.user.email } }),
  ]);
  return {
    client,
    leadIds,
    contacts,
    summary: {
      "Health profile versions": healthProfiles,
      Measurements: measurements,
      "Meal logs": foodLogs,
      "Water logs": waterLogs,
      "Diet plans": plans,
      "Progress reports": reports,
      Documents: documents,
      Messages: messages,
      "Consultation notes": consultNotes,
      "Leads and assessments": leadIds.length,
      "Website enquiries with the same phone or email": enquiries,
      "Sent-email records": notifications,
    } as Record<string, number>,
  };
}

/** What erasing this client would remove — shown before anyone confirms. */
export async function erasurePreview(clinicId: string, clientId: string) {
  const { client, summary } = await counts(prisma, clinicId, clientId);
  return { alreadyErased: Boolean(client.deletedAt), summary, retained: RETAINED_AFTER_ERASURE };
}

export async function eraseClient(actor: Actor, clientId: string, input: { confirmCode: string; requestId?: string }) {
  const preview = await counts(prisma, actor.clinicId, clientId);
  const { client, leadIds, contacts } = preview;
  if (client.deletedAt) throw conflict("This client has already been erased.");
  if (input.confirmCode.trim().toUpperCase() !== client.clientCode.toUpperCase()) {
    throw invalid(`Type the client code (${client.clientCode}) to confirm.`);
  }
  if (input.requestId) {
    const request = await prisma.dataRequest.findFirst({ where: { id: input.requestId, clientId, type: "DELETE" } });
    if (!request) throw notFound("Deletion request");
    if (request.status === "COMPLETED" || request.status === "REJECTED") throw conflict("That request is already closed.");
  }

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    const byClient = { clientId };
    await tx.healthProfile.deleteMany({ where: byClient });
    await tx.measurement.deleteMany({ where: byClient });
    await tx.foodLog.deleteMany({ where: byClient });
    await tx.waterLog.deleteMany({ where: byClient });
    await tx.badge.deleteMany({ where: byClient });
    await tx.progressReport.deleteMany({ where: byClient });
    await tx.document.deleteMany({ where: byClient }); // encrypted files cascade
    await tx.dietPlan.deleteMany({ where: byClient }); // days, slots, items and sections cascade
    await tx.messageThread.deleteMany({ where: byClient }); // messages cascade

    const appointmentScope = { OR: [{ clientId }, ...(leadIds.length ? [{ leadId: { in: leadIds } }] : [])] };
    await tx.consultationNote.deleteMany({ where: { appointment: appointmentScope } });
    await tx.appointment.updateMany({ where: appointmentScope, data: { reason: null, notes: null, meetingUrl: null, leadId: null } });

    await tx.assessment.deleteMany({ where: { OR: [{ clientId }, ...(leadIds.length ? [{ leadId: { in: leadIds } }] : [])] } });
    if (leadIds.length) {
      await tx.lead.updateMany({ where: { duplicateOfLeadId: { in: leadIds } }, data: { duplicateOfLeadId: null } });
      await tx.lead.deleteMany({ where: { id: { in: leadIds } } }); // activities cascade
    }
    if (contacts.length) {
      await tx.contactMessage.deleteMany({ where: { clinicId: actor.clinicId, OR: [{ phone: { in: contacts } }, { email: { in: contacts } }] } });
    }
    await tx.notification.deleteMany({ where: { clinicId: actor.clinicId, recipient: client.user.email } });

    await tx.client.update({
      where: { id: clientId },
      data: {
        dob: null, gender: null, city: null, occupation: null, emergencyContact: null,
        heightCm: null, startWeightKg: null, targetWeightKg: null, targetDate: null,
        foodPreference: null, allergies: Prisma.DbNull, dislikes: Prisma.DbNull, mealTimes: Prisma.DbNull,
        cooksAtHome: null, eatsOutFrequency: null, primaryDietitianId: null,
        status: "ARCHIVED", deletedAt: now,
      },
    });

    await tx.user.update({
      where: { id: client.user.id },
      data: {
        name: "Erased client",
        email: `erased@${client.user.id}.erased.ozmo.local`,
        phone: null, passwordHash: null, inviteToken: null, inviteExpiresAt: null,
        isActive: false, sessionVersion: { increment: 1 }, deletedAt: now,
      },
    });

    if (input.requestId) {
      await tx.dataRequest.update({
        where: { id: input.requestId },
        data: { status: "COMPLETED", resolvedAt: now, resolution: `Erased on ${now.toISOString().slice(0, 10)}. Retained: ${RETAINED_AFTER_ERASURE.join("; ")}.` },
      });
    }
    await audit(tx, actor, "CLIENT_ERASED", { type: "Client", id: clientId }, { removed: preview.summary, requestId: input.requestId ?? null });
  }, { timeout: 30_000 });
}
