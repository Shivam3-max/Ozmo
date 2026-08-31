import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, isStaff } from "@/lib/auth";
import { CLINIC_ID, logLeadActivity } from "@/lib/leads";

export const runtime = "nodejs";

const schema = z.object({
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Unknown status." }, { status: 422 });

  const appt = await prisma.appointment.findUnique({ where: { id }, include: { lead: true } });
  if (!appt) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });

  await prisma.appointment.update({ where: { id }, data: { status: parsed.data.status } });

  // A completed initial consultation moves the lead forward on its own.
  if (appt.leadId) {
    await logLeadActivity(appt.leadId, `APPOINTMENT_${parsed.data.status}`, appt.scheduledAt.toISOString(), session.sub);
    if (parsed.data.status === "COMPLETED" && appt.lead?.stage === "CONSULTATION_BOOKED") {
      await prisma.lead.update({ where: { id: appt.leadId }, data: { stage: "CONSULTED" } });
    }
  }

  if (parsed.data.status === "COMPLETED" && appt.clientId && appt.type === "FOLLOW_UP") {
    const enrollment = await prisma.enrollment.findFirst({
      where: { clientId: appt.clientId, status: "ACTIVE" },
      orderBy: { startDate: "desc" },
    });
    if (enrollment) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { followUpsUsed: { increment: 1 } },
      });
    }
  }

  await prisma.auditLog.create({
    data: {
      clinicId: CLINIC_ID,
      actorId: session.sub,
      action: "APPOINTMENT_UPDATED",
      entityType: "Appointment",
      entityId: id,
      changes: { from: appt.status, to: parsed.data.status },
    },
  });

  return NextResponse.json({ ok: true });
}
