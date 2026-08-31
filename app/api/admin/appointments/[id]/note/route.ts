import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, canEditPlans } from "@/lib/auth";
import { CLINIC_ID } from "@/lib/leads";

export const runtime = "nodejs";

const schema = z.object({
  subjective: z.string().trim().max(4000).optional().or(z.literal("")),
  observations: z.string().trim().max(4000).optional().or(z.literal("")),
  planOfAction: z.string().trim().max(4000).optional().or(z.literal("")),
  nextReviewAt: z.string().optional().or(z.literal("")),
  sharedWithClient: z.boolean().default(false),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !canEditPlans(session.role)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the note." }, { status: 422 });
  const d = parsed.data;

  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });

  const data = {
    subjective: d.subjective || null,
    observations: d.observations || null,
    planOfAction: d.planOfAction || null,
    nextReviewAt: d.nextReviewAt ? new Date(d.nextReviewAt) : null,
    sharedWithClient: d.sharedWithClient,
  };

  await prisma.consultationNote.upsert({
    where: { appointmentId: id },
    update: data,
    create: { ...data, appointmentId: id, createdById: session.sub },
  });

  await prisma.auditLog.create({
    data: {
      clinicId: CLINIC_ID, actorId: session.sub, action: "CONSULT_NOTE_SAVED",
      entityType: "Appointment", entityId: id,
    },
  });

  return NextResponse.json({ ok: true });
}
