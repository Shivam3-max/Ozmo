import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { audit } from "@/lib/services/audit";

export const runtime = "nodejs";

/** Stages staff set by hand. "Converted" only comes from creating the client (the convert flow). */
const MANUAL_STAGES = ["NEW", "CONTACTED", "CONSULTATION_BOOKED", "CONSULTED", "LOST"] as const;

const patchSchema = z.object({
  stage: z.string(),
  lostReason: z.string().trim().max(120).optional(),
  note: z.string().trim().max(2000, "Notes are limited to 2,000 characters.").optional(),
});

export const PATCH = apiHandler(async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("leads.manage");

  const { id } = await ctx.params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the values." }, { status: 422 });
  }
  const { stage, lostReason, note } = parsed.data;

  // Scope by clinic as well as id — the id alone is not an authorisation check.
  const lead = await prisma.lead.findFirst({ where: { id, clinicId: session.clinicId } });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  const converted = lead.stage === "CONVERTED" || Boolean(lead.convertedClientId);
  const changingStage = stage !== lead.stage;
  if (changingStage && stage === "CONVERTED") {
    return NextResponse.json({ error: "Use “Convert to client” to create their client record — that marks the lead converted." }, { status: 422 });
  }
  if (changingStage && converted) {
    return NextResponse.json({ error: "This lead is already a client, so its stage can't change. You can still add a note." }, { status: 409 });
  }
  if (changingStage && !(MANUAL_STAGES as readonly string[]).includes(stage)) {
    return NextResponse.json({ error: "Choose a stage from the list." }, { status: 422 });
  }
  if (changingStage && stage === "LOST" && !lostReason) {
    return NextResponse.json({ error: "A reason is required when marking a lead lost." }, { status: 422 });
  }
  if (!changingStage && !note) return NextResponse.json({ ok: true });

  await prisma.$transaction(async (tx) => {
    if (changingStage) {
      await tx.lead.update({
        where: { id },
        data: {
          stage: stage as (typeof MANUAL_STAGES)[number],
          lostReason: stage === "LOST" ? lostReason : null,
          assignedToId: lead.assignedToId ?? session.sub,
        },
      });
      await tx.leadActivity.create({
        data: { leadId: id, type: "STAGE_CHANGED", staffId: session.sub, note: `${lead.stage.toLowerCase()} → ${stage.toLowerCase()}${stage === "LOST" && lostReason ? ` (${lostReason})` : ""}` },
      });
    }
    if (note) await tx.leadActivity.create({ data: { leadId: id, type: "NOTE", note, staffId: session.sub } });
    await audit(tx, session, "LEAD_UPDATED", { type: "Lead", id }, changingStage ? { from: lead.stage, to: stage } : { note: true });
  });

  return NextResponse.json({ ok: true });
});
