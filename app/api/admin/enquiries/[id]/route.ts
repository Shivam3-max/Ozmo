import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";

export const runtime = "nodejs";

const schema = z.object({ handled: z.boolean() });

export const PATCH = apiHandler(async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("enquiries.manage");

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 422 });

  const { id } = await ctx.params;
  const message = await prisma.contactMessage.findFirst({ where: { id, clinicId: session.clinicId } });
  if (!message) return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
  if (Boolean(message.handledAt) === parsed.data.handled) return NextResponse.json({ ok: true });

  await prisma.$transaction([
    prisma.contactMessage.update({
      where: { id },
      data: parsed.data.handled
        ? { handledAt: new Date(), handledById: session.sub }
        : { handledAt: null, handledById: null },
    }),
    prisma.auditLog.create({
      data: {
        clinicId: session.clinicId, actorId: session.sub,
        action: parsed.data.handled ? "ENQUIRY_HANDLED" : "ENQUIRY_REOPENED",
        entityType: "ContactMessage", entityId: id,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
});
