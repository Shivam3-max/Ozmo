import { Prisma } from "@prisma/client";
import { CLINIC_ID } from "@/lib/clinic";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { slotKeyFor } from "@/lib/leads";
import { clinicWallTime, formatClinic } from "@/lib/clinic-time";
import { conflict, invalid, notFound } from "@/lib/errors";
import { audit, type Actor, type Db } from "@/lib/services/audit";
import { deliver, queue } from "@/lib/notifications/outbox";
import * as email from "@/lib/notifications/templates";

/** Longest appointment we allow; bounds how far back a clash search has to look. */
export const MAX_APPOINTMENT_MINUTES = 180;
export const SCHEDULE_AHEAD_DAYS = 180;

/** Public booking offers these start times, each a 60-minute slot, clinic time. */
export const BOOKABLE_TIMES = ["10:00", "10:45", "11:30", "12:15", "15:00", "15:45", "16:30", "17:15", "18:00"];

/** Video-call links must be full https URLs — they're shown to the client as a button. */
export const meetingUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => {
    try {
      return new URL(v).protocol === "https:";
    } catch {
      return false;
    }
  }, "Paste the full https:// link for the video call.");

const clinicScope = (clinicId: string): Prisma.AppointmentWhereInput => ({
  OR: [{ lead: { clinicId } }, { client: { clinicId } }],
});

const whenLabel = (at: Date) => formatClinic(at, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

/**
 * A scheduled appointment that overlaps [start, start + minutes), if any.
 * One consulting diary per clinic: the practice has one dietitian seeing people.
 */
export async function findClash(db: Db, start: Date, minutes: number, { clinicId = CLINIC_ID, excludeId }: { clinicId?: string; excludeId?: string } = {}) {
  const end = new Date(start.getTime() + minutes * 60_000);
  const candidates = await db.appointment.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { gt: new Date(start.getTime() - MAX_APPOINTMENT_MINUTES * 60_000), lt: end },
      ...(excludeId ? { id: { not: excludeId } } : {}),
      ...clinicScope(clinicId),
    },
    select: { id: true, scheduledAt: true, durationMin: true, lead: { select: { name: true } }, client: { select: { user: { select: { name: true } } } } },
    orderBy: { scheduledAt: "asc" },
  });
  return candidates.find((a) => a.scheduledAt.getTime() + a.durationMin * 60_000 > start.getTime()) ?? null;
}

/** Which public booking times on a clinic day are unavailable because something overlaps them. */
export async function unavailableTimes(db: Db, dayStart: Date, slotStart: (time: string) => Date, slotMinutes = 60) {
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60_000);
  const scheduled = await db.appointment.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { gt: new Date(dayStart.getTime() - MAX_APPOINTMENT_MINUTES * 60_000), lt: dayEnd },
      ...clinicScope(CLINIC_ID),
    },
    select: { scheduledAt: true, durationMin: true },
  });
  return BOOKABLE_TIMES.filter((time) => {
    const start = slotStart(time).getTime();
    const end = start + slotMinutes * 60_000;
    return scheduled.some((a) => a.scheduledAt.getTime() < end && a.scheduledAt.getTime() + a.durationMin * 60_000 > start);
  });
}

const isConflict = (err: unknown) => err instanceof Prisma.PrismaClientKnownRequestError && (err.code === "P2002" || err.code === "P2034");

export type ScheduleInput = {
  clientId?: string;
  leadId?: string;
  type: "INITIAL" | "FOLLOW_UP";
  mode: "IN_CLINIC" | "VIDEO";
  date: string;
  time: string;
  durationMin: number;
  meetingUrl?: string;
  reason?: string;
};

/** Staff put an appointment on the clinic diary — typically a client's follow-up — and the client is emailed. */
export async function scheduleAppointment(actor: Actor & { role: string }, input: ScheduleInput) {
  const start = clinicWallTime(input.date, input.time);
  if (!start) throw invalid("That date or time isn't valid.");
  if (start.getTime() <= Date.now()) throw invalid("Choose a time in the future.");
  if (start.getTime() > Date.now() + SCHEDULE_AHEAD_DAYS * 864e5) throw invalid(`Appointments can be booked up to ${SCHEDULE_AHEAD_DAYS} days ahead.`);

  // Resolve the person, always within this clinic. A converted lead is booked on the client.
  let clientId: string | null = null;
  let leadId: string | null = null;
  let dietitianId: string | null = actor.role === "DIETITIAN" ? actor.sub : null;
  let recipient: { name: string; email: string | null } | null = null;

  if (input.clientId) {
    const client = await prisma.client.findFirst({ where: { id: input.clientId, clinicId: actor.clinicId, deletedAt: null }, include: { user: true } });
    if (!client) throw notFound("Client");
    if (client.status === "ARCHIVED") throw conflict("This client is archived. Change their status first.");
    clientId = client.id;
    dietitianId ??= client.primaryDietitianId;
    recipient = { name: client.user.name, email: client.user.email };
  } else if (input.leadId) {
    const lead = await prisma.lead.findFirst({ where: { id: input.leadId, clinicId: actor.clinicId } });
    if (!lead) throw notFound("Lead");
    leadId = lead.id;
    clientId = lead.convertedClientId;
    recipient = { name: lead.name, email: lead.email };
  } else {
    throw invalid("Choose who the appointment is for.");
  }

  try {
    const { appointment, notificationId } = await prisma.$transaction(async (tx) => {
      const clash = await findClash(tx, start, input.durationMin, { clinicId: actor.clinicId });
      if (clash) {
        const who = clash.client?.user.name ?? clash.lead?.name ?? "someone";
        throw conflict(`That overlaps ${who}'s appointment at ${formatClinic(clash.scheduledAt, { hour: "2-digit", minute: "2-digit" })}. Choose another time.`);
      }
      const meetingUrl = input.mode === "VIDEO" && input.meetingUrl ? input.meetingUrl : null;
      const created = await tx.appointment.create({
        data: {
          clientId, leadId, dietitianId,
          type: input.type, mode: input.mode, status: "SCHEDULED",
          scheduledAt: start, durationMin: input.durationMin, slotKey: slotKeyFor(start),
          meetingUrl, reason: input.reason || null,
        },
      });
      if (leadId) {
        await tx.leadActivity.create({ data: { leadId, type: "APPOINTMENT_SCHEDULED", note: `${input.date} ${input.time} · ${input.mode === "VIDEO" ? "video" : "clinic"}`, staffId: actor.sub } });
        await tx.lead.updateMany({ where: { id: leadId, stage: { in: ["NEW", "CONTACTED"] } }, data: { stage: "CONSULTATION_BOOKED" } });
      }
      await audit(tx, actor, "APPOINTMENT_CREATED", { type: "Appointment", id: created.id }, { type: input.type, mode: input.mode });
      const nid = await queue(tx, {
        clinicId: actor.clinicId, kind: "APPOINTMENT_SCHEDULED", to: recipient?.email,
        email: email.appointmentScheduled(recipient?.name ?? "", whenLabel(start), input.mode, meetingUrl),
        related: { type: "Appointment", id: created.id }, createdById: actor.sub,
      });
      return { appointment: created, notificationId: nid };
    }, { isolationLevel: "Serializable" });

    const emailed = notificationId ? (await deliver([notificationId]))[notificationId] : "NO_ADDRESS";
    return { appointmentId: appointment.id, emailed };
  } catch (err) {
    if (isConflict(err)) throw conflict("That time was just taken. Choose another time.");
    throw err;
  }
}

/**
 * A scheduled appointment can be closed any way; a closed one can only be
 * reopened (to undo a mis-click). Closed → closed is never a real event.
 */
export const statusChangeAllowed = (from: string, to: string) => (from === "SCHEDULED" ? to !== "SCHEDULED" : to === "SCHEDULED");

async function findForClinic(clinicId: string, id: string) {
  const appt = await prisma.appointment.findFirst({ where: { id, ...clinicScope(clinicId) }, include: { lead: true, client: { include: { user: true } } } });
  if (!appt) throw notFound("Appointment");
  return appt;
}

export async function changeAppointmentStatus(actor: Actor, id: string, to: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW") {
  const appt = await findForClinic(actor.clinicId, id);
  if (appt.status === to) return;
  if (!statusChangeAllowed(appt.status, to)) throw conflict(`A ${appt.status.toLowerCase().replace("_", " ")} appointment can only be reopened.`);

  try {
    await prisma.$transaction(async (tx) => {
      if (to === "SCHEDULED" && (await findClash(tx, appt.scheduledAt, appt.durationMin, { clinicId: actor.clinicId, excludeId: id }))) {
        throw conflict("That time has been booked again since, so this can't be reopened.");
      }
      // Only a scheduled appointment holds its time; closing it frees the slot.
      await tx.appointment.update({ where: { id }, data: { status: to, slotKey: to === "SCHEDULED" ? slotKeyFor(appt.scheduledAt) : null } });

      if (appt.leadId) {
        await tx.leadActivity.create({ data: { leadId: appt.leadId, type: `APPOINTMENT_${to}`, note: appt.scheduledAt.toISOString(), staffId: actor.sub } });
        // A completed initial consultation moves the lead forward on its own.
        if (to === "COMPLETED" && appt.lead?.stage === "CONSULTATION_BOOKED") {
          await tx.lead.update({ where: { id: appt.leadId }, data: { stage: "CONSULTED" } });
        }
      }
      if (appt.clientId && appt.type === "FOLLOW_UP" && (to === "COMPLETED" || appt.status === "COMPLETED")) {
        const enrollment = await tx.enrollment.findFirst({ where: { clientId: appt.clientId, status: "ACTIVE" }, orderBy: { startDate: "desc" } });
        if (enrollment) {
          await tx.enrollment.update({ where: { id: enrollment.id }, data: { followUpsUsed: to === "COMPLETED" ? { increment: 1 } : { decrement: 1 } } });
        }
      }
      await audit(tx, actor, "APPOINTMENT_UPDATED", { type: "Appointment", id }, { from: appt.status, to });
    });
  } catch (err) {
    if (isConflict(err)) throw conflict("That time has been booked again since, so this can't be reopened.");
    throw err;
  }
}

/** Adds or changes the join link on an upcoming video appointment, and emails it to the client. */
export async function setMeetingLink(actor: Actor, id: string, meetingUrl: string) {
  const appt = await findForClinic(actor.clinicId, id);
  if (appt.status !== "SCHEDULED" || appt.mode !== "VIDEO") throw conflict("Links can only be added to upcoming video appointments.");

  const person = appt.client ? { name: appt.client.user.name, email: appt.client.user.email } : appt.lead ? { name: appt.lead.name, email: appt.lead.email } : null;
  const notificationId = await prisma.$transaction(async (tx) => {
    await tx.appointment.update({ where: { id }, data: { meetingUrl: meetingUrl || null } });
    await audit(tx, actor, "APPOINTMENT_LINK_SET", { type: "Appointment", id });
    if (!meetingUrl || appt.scheduledAt.getTime() < Date.now()) return null;
    return queue(tx, {
      clinicId: actor.clinicId, kind: "APPOINTMENT_LINK", to: person?.email,
      email: email.videoLinkAdded(person?.name ?? "", whenLabel(appt.scheduledAt), meetingUrl),
      related: { type: "Appointment", id }, createdById: actor.sub,
    });
  });
  const emailed = notificationId ? (await deliver([notificationId]))[notificationId] : "NO_ADDRESS";
  return { emailed };
}
