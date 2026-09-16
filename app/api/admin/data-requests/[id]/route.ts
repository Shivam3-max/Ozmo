import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";

export const runtime = "nodejs";

const bodySchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "REJECTED"]),
  resolution: z.string().trim().max(1000).optional(),
}).superRefine((value, context) => {
  if ((value.status === "COMPLETED" || value.status === "REJECTED") && !value.resolution) {
    context.addIssue({ code: "custom", path: ["resolution"], message: "A resolution note is required." });
  }
});

export const PATCH = apiHandler(async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await authorize("privacy.manage");

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const { id } = await params;
  const existing = await prisma.dataRequest.findFirst({
    where: { id, client: { clinicId: session.clinicId } },
  });
  if (!existing) return NextResponse.json({ error: "Request not found." }, { status: 404 });

  const closed = parsed.data.status === "COMPLETED" || parsed.data.status === "REJECTED";
  await prisma.$transaction([
    prisma.dataRequest.update({
      where: { id },
      data: {
        status: parsed.data.status,
        resolution: parsed.data.resolution ?? (closed ? existing.resolution : null),
        resolvedAt: closed ? new Date() : null,
      },
    }),
    prisma.auditLog.create({
      data: {
        clinicId: session.clinicId,
        actorId: session.sub,
        action: "DATA_REQUEST_STATUS_CHANGED",
        entityType: "DataRequest",
        entityId: id,
        changes: { from: existing.status, to: parsed.data.status, resolution: parsed.data.resolution },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
});
