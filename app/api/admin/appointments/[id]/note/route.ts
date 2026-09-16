import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { dateInputSchema } from "@/lib/validation";

export const runtime = "nodejs";

const schema = z.object({
  subjective: z.string().trim().max(4000).optional().or(z.literal("")),
  observations: z.string().trim().max(4000).optional().or(z.literal("")),
  planOfAction: z.string().trim().max(4000).optional().or(z.literal("")),
  nextReviewAt: dateInputSchema.optional(),
  sharedWithClient: z.boolean().default(false),
});

export const PUT = apiHandler(async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("notes.write");

  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the note." }, { status: 422 });
  const d = parsed.data;

  const appt = await prisma.appointment.findFirst({
    where: { id, OR: [{ lead: { clinicId: session.clinicId } }, { client: { clinicId: session.clinicId } }] },
  });
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
      clinicId: session.clinicId, actorId: session.sub, action: "CONSULT_NOTE_SAVED",
      entityType: "Appointment", entityId: id,
    },
  });

  return NextResponse.json({ ok: true });
});
