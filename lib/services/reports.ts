import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { addDays, clinicDay, dayKey, daysBetween, formatClinic } from "@/lib/clinic-time";
import { conflict, invalid, notFound } from "@/lib/errors";
import { audit, type Actor } from "@/lib/services/audit";
import { deliver, queue, siteLink } from "@/lib/notifications/outbox";
import * as email from "@/lib/notifications/templates";

/**
 * Monthly progress reports. Ozmo drafts the numbers from what was recorded in
 * the period; the dietitian writes the observations and next month's focus,
 * approves it, and only then does the client see it. The numbers are frozen
 * into the report so a sent report never changes underneath the client.
 */
export type ReportData = {
  days: number;
  weight: { start: number | null; end: number | null; change: number | null };
  waist: { start: number | null; end: number | null; change: number | null };
  weighIns: number;
  daysLogged: number;
  mealsLogged: number;
  offPlanMeals: number;
  hydrationDays: number;
  followUpsCompleted: number;
  planTitle: string | null;
};

const round1 = (n: number) => Math.round(n * 10) / 10;
const delta = (start: number | null, end: number | null) => (start !== null && end !== null ? round1(end - start) : null);

export async function buildReportData(clientId: string, periodStart: Date, periodEnd: Date): Promise<ReportData> {
  const endExclusive = addDays(periodEnd, 1);
  const inPeriod = { gte: periodStart, lt: endExclusive };
  const [before, measurements, logs, water, followUps, plan] = await Promise.all([
    // The last reading before the period is the fairest starting point.
    prisma.measurement.findFirst({ where: { clientId, date: { lt: periodStart }, OR: [{ weightKg: { not: null } }, { waistCm: { not: null } }] }, orderBy: { date: "desc" } }),
    prisma.measurement.findMany({ where: { clientId, date: inPeriod }, orderBy: { date: "asc" } }),
    prisma.foodLog.findMany({ where: { clientId, date: inPeriod }, select: { date: true, source: true } }),
    prisma.waterLog.findMany({ where: { clientId, date: inPeriod }, select: { glasses: true, targetGlasses: true } }),
    prisma.appointment.count({ where: { clientId, type: "FOLLOW_UP", status: "COMPLETED", scheduledAt: inPeriod } }),
    prisma.dietPlan.findFirst({ where: { clientId, status: "ACTIVE" }, orderBy: { version: "desc" }, select: { title: true } }),
  ]);

  const series = (pick: (m: { weightKg: number | null; waistCm: number | null }) => number | null) => {
    const values = [before, ...measurements].filter(Boolean).map((m) => pick(m!)).filter((v): v is number => v !== null);
    const start = values[0] ?? null;
    const end = values.length > 1 ? values[values.length - 1] : null;
    return { start, end, change: delta(start, end) };
  };

  return {
    days: daysBetween(periodStart, periodEnd) + 1,
    weight: series((m) => m.weightKg),
    waist: series((m) => m.waistCm),
    weighIns: measurements.filter((m) => m.weightKg !== null).length,
    daysLogged: new Set(logs.map((l) => dayKey(l.date))).size,
    mealsLogged: logs.length,
    offPlanMeals: logs.filter((l) => l.source === "OFF_PLAN").length,
    hydrationDays: water.filter((w) => w.glasses >= (w.targetGlasses || 8)).length,
    followUpsCompleted: followUps,
    planTitle: plan?.title ?? null,
  };
}

export const periodLabel = (start: Date, end: Date) =>
  `${formatClinic(start, { day: "numeric", month: "short" })} – ${formatClinic(end, { day: "numeric", month: "short", year: "numeric" })}`;

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date");
export const newReportSchema = z
  .object({ periodStart: dateOnly.optional(), periodEnd: dateOnly.optional() })
  .transform((v) => {
    const end = v.periodEnd ? new Date(`${v.periodEnd}T00:00:00.000Z`) : clinicDay();
    const start = v.periodStart ? new Date(`${v.periodStart}T00:00:00.000Z`) : addDays(end, -29);
    return { start, end };
  })
  .refine((p) => p.start <= p.end, "The period must start before it ends.")
  .refine((p) => daysBetween(p.start, p.end) <= 120, "A report covers at most four months.");

export const reportTextSchema = z.object({
  observations: z.string().max(5000, "Observations are limited to 5,000 characters.").optional(),
  nextMonthFocus: z.string().max(3000, "Next month's focus is limited to 3,000 characters.").optional(),
});

async function findReport(clinicId: string, id: string) {
  const report = await prisma.progressReport.findFirst({
    where: { id, client: { clinicId, deletedAt: null } },
    include: { client: { include: { user: { select: { name: true, email: true } } } } },
  });
  if (!report) throw notFound("Report");
  return report;
}

export async function createReport(actor: Actor, clientId: string, period: { start: Date; end: Date }) {
  const client = await prisma.client.findFirst({ where: { id: clientId, clinicId: actor.clinicId, deletedAt: null }, select: { id: true } });
  if (!client) throw notFound("Client");
  const data = await buildReportData(clientId, period.start, period.end);
  return prisma.$transaction(async (tx) => {
    const report = await tx.progressReport.create({
      data: { clientId, periodStart: period.start, periodEnd: period.end, data: data as unknown as Prisma.InputJsonValue, createdById: actor.sub },
    });
    await audit(tx, actor, "REPORT_CREATED", { type: "ProgressReport", id: report.id }, { clientId });
    return report;
  });
}

/** Saves the dietitian's text. Editing an approved report sends it back to draft. */
export async function updateReport(actor: Actor, id: string, input: z.infer<typeof reportTextSchema> & { refresh?: boolean }) {
  const report = await findReport(actor.clinicId, id);
  if (report.status === "SENT") throw conflict("This report has already been shared with the client and can't be changed.");
  const data = input.refresh ? await buildReportData(report.clientId, report.periodStart, report.periodEnd) : undefined;
  await prisma.$transaction(async (tx) => {
    await tx.progressReport.update({
      where: { id },
      data: {
        observations: input.observations?.trim() ?? undefined,
        nextMonthFocus: input.nextMonthFocus?.trim() ?? undefined,
        ...(data ? { data: data as unknown as Prisma.InputJsonValue } : {}),
        status: "DRAFT", approvedById: null, approvedAt: null,
      },
    });
    await audit(tx, actor, "REPORT_UPDATED", { type: "ProgressReport", id }, { refreshed: Boolean(data), reopened: report.status === "APPROVED" });
  });
}

export async function approveReport(actor: Actor, id: string) {
  const report = await findReport(actor.clinicId, id);
  if (report.status !== "DRAFT") throw conflict(report.status === "SENT" ? "This report has already been shared." : "This report is already approved.");
  if (!report.observations?.trim()) throw invalid("Write your observations before approving — they're the heart of the report.");
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.progressReport.updateMany({ where: { id, status: "DRAFT" }, data: { status: "APPROVED", approvedById: actor.sub, approvedAt: new Date() } });
    if (count === 0) throw conflict("This report changed while you were approving it. Reload and try again.");
    await audit(tx, actor, "REPORT_APPROVED", { type: "ProgressReport", id });
  });
}

/** Shares an approved report: visible in the portal, counted against the programme, and emailed. */
export async function sendReport(actor: Actor, id: string) {
  const report = await findReport(actor.clinicId, id);
  if (report.status !== "APPROVED") throw conflict(report.status === "SENT" ? "This report has already been shared." : "Approve the report before sharing it.");

  const notificationId = await prisma.$transaction(async (tx) => {
    const { count } = await tx.progressReport.updateMany({ where: { id, status: "APPROVED" }, data: { status: "SENT", sentAt: new Date() } });
    if (count === 0) throw conflict("This report changed while you were sharing it. Reload and try again.");
    const enrollment = await tx.enrollment.findFirst({ where: { clientId: report.clientId, status: "ACTIVE" }, orderBy: { startDate: "desc" } });
    if (enrollment) await tx.enrollment.update({ where: { id: enrollment.id }, data: { reportsDelivered: { increment: 1 } } });
    await audit(tx, actor, "REPORT_SENT", { type: "ProgressReport", id });
    return queue(tx, {
      clinicId: actor.clinicId, kind: "REPORT_READY", to: report.client.user.email,
      email: email.reportReady(report.client.user.name, periodLabel(report.periodStart, report.periodEnd), siteLink(`/portal/reports/${id}`)),
      related: { type: "ProgressReport", id }, createdById: actor.sub,
    });
  });
  const emailed = notificationId ? (await deliver([notificationId]))[notificationId] : "NO_ADDRESS";
  return { emailed };
}

export async function discardReport(actor: Actor, id: string) {
  const report = await findReport(actor.clinicId, id);
  if (report.status === "SENT") throw conflict("A shared report stays on the client's record.");
  await prisma.$transaction(async (tx) => {
    await tx.progressReport.delete({ where: { id } });
    await audit(tx, actor, "REPORT_DISCARDED", { type: "ProgressReport", id }, { clientId: report.clientId });
  });
}

export const asReportData = (value: unknown) => value as ReportData | null;
