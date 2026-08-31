import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, canSeeHealthData } from "@/lib/auth";
import { CLINIC_ID } from "@/lib/leads";

export const runtime = "nodejs";

const optional = (max: number) =>
  z.union([z.coerce.number().min(0).max(max), z.literal("")]).optional().nullable();

const schema = z.object({
  date: z.string().optional(),
  weightKg: optional(400),
  waistCm: optional(250),
  hipCm: optional(250),
  chestCm: optional(250),
  armCm: optional(120),
  bodyFatPct: optional(80),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !canSeeHealthData(session.role)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the values." }, { status: 422 });

  const client = await prisma.client.findFirst({ where: { id, clinicId: CLINIC_ID } });
  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  const d = parsed.data;
  const n = (v: unknown) => (v === "" || v === null || v === undefined ? null : Number(v));

  if (!n(d.weightKg) && !n(d.waistCm) && !n(d.hipCm) && !n(d.chestCm) && !n(d.armCm) && !n(d.bodyFatPct)) {
    return NextResponse.json({ error: "Enter at least one measurement." }, { status: 422 });
  }

  const m = await prisma.measurement.create({
    data: {
      clientId: id,
      date: d.date ? new Date(d.date) : new Date(),
      weightKg: n(d.weightKg),
      waistCm: n(d.waistCm),
      hipCm: n(d.hipCm),
      chestCm: n(d.chestCm),
      armCm: n(d.armCm),
      bodyFatPct: n(d.bodyFatPct),
      note: d.note || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      clinicId: CLINIC_ID, actorId: session.sub, action: "MEASUREMENT_ADDED",
      entityType: "Client", entityId: id, changes: { weightKg: m.weightKg },
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
