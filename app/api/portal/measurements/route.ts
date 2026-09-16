import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";

export const runtime = "nodejs";

const optional = (max: number) =>
  z.union([z.coerce.number().min(0).max(max), z.literal("")]).optional().nullable();

const schema = z.object({
  weightKg: optional(400),
  waistCm: optional(250),
  hipCm: optional(250),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

export const POST = apiHandler(async function POST(req: Request) {
  const session = await authorize("portal.self");
  const client = await prisma.client.findFirst({
    where: { userId: session.sub, deletedAt: null },
    select: { id: true, clinicId: true },
  });
  if (!client) return NextResponse.json({ error: "No client record." }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the numbers." }, { status: 422 });

  const n = (v: unknown) => (v === "" || v === null || v === undefined ? null : Number(v));
  const d = parsed.data;
  if (!n(d.weightKg) && !n(d.waistCm) && !n(d.hipCm)) {
    return NextResponse.json({ error: "Enter at least one number." }, { status: 422 });
  }

  await prisma.$transaction(async (tx) => {
    const m = await tx.measurement.create({
      data: {
        clientId: client.id,
        date: new Date(),
        weightKg: n(d.weightKg),
        waistCm: n(d.waistCm),
        hipCm: n(d.hipCm),
        note: d.note || null,
      },
    });
    await tx.auditLog.create({
      data: {
        clinicId: client.clinicId, actorId: session.sub, action: "MEASUREMENT_ADDED_BY_CLIENT",
        entityType: "Client", entityId: client.id, changes: { measurementId: m.id },
      },
    });
  });

  return NextResponse.json({ ok: true }, { status: 201 });
});
