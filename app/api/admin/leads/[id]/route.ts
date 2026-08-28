import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, isStaff } from "@/lib/auth";
import { logLeadActivity, CLINIC_ID } from "@/lib/leads";

export const runtime = "nodejs";

const patchSchema = z.object({
  stage: z.enum(["NEW", "CONTACTED", "CONSULTATION_BOOKED", "CONSULTED", "CONVERTED", "LOST"]),
  lostReason: z.string().trim().max(120).optional(),
  note: z.string().trim().max(2000).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the values." }, { status: 422 });
  }
  const { stage, lostReason, note } = parsed.data;

  if (stage === "LOST" && !lostReason) {
    return NextResponse.json({ error: "A reason is required when marking a lead lost." }, { status: 422 });
  }

  // Scope by clinic as well as id — the id alone is not an authorisation check.
  const lead = await prisma.lead.findFirst({ where: { id, clinicId: CLINIC_ID } });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  await prisma.lead.update({
    where: { id },
    data: { stage, lostReason: stage === "LOST" ? lostReason : null, assignedToId: lead.assignedToId ?? session.sub },
  });

  if (lead.stage !== stage) {
    await logLeadActivity(
      id,
      "STAGE_CHANGED",
      `${lead.stage.toLowerCase()} → ${stage.toLowerCase()}${lostReason ? ` (${lostReason})` : ""}`,
      session.sub
    );
  }
  if (note) await logLeadActivity(id, "NOTE", note, session.sub);

  await prisma.auditLog.create({
    data: {
      clinicId: CLINIC_ID,
      actorId: session.sub,
      action: "LEAD_UPDATED",
      entityType: "Lead",
      entityId: id,
      changes: { from: lead.stage, to: stage },
    },
  });

  return NextResponse.json({ ok: true });
}
