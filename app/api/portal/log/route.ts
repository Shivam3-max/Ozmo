import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { startOfDay } from "@/lib/portal";

export const runtime = "nodejs";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("meal"),
    slotLabel: z.string().trim().min(1).max(160),
    source: z.enum(["FROM_PLAN", "SWAPPED", "OFF_PLAN"]).default("FROM_PLAN"),
    customText: z.string().trim().max(500).optional().or(z.literal("")),
  }),
  z.object({ action: z.literal("unmeal"), slotLabel: z.string().trim().min(1).max(160) }),
  z.object({ action: z.literal("water"), glasses: z.coerce.number().int().min(0).max(30) }),
]);

/** Everything scopes through the signed-in client — never a client id from the body. */
async function clientForSession() {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") return null;
  return prisma.client.findFirst({ where: { userId: session.sub, deletedAt: null }, select: { id: true } });
}

export async function POST(req: Request) {
  const client = await clientForSession();
  if (!client) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Couldn't record that." }, { status: 422 });

  const today = startOfDay();
  const d = parsed.data;

  if (d.action === "water") {
    const row = await prisma.waterLog.upsert({
      where: { clientId_date: { clientId: client.id, date: today } },
      update: { glasses: d.glasses },
      create: { clientId: client.id, date: today, glasses: d.glasses },
    });
    return NextResponse.json({ ok: true, glasses: row.glasses });
  }

  if (d.action === "unmeal") {
    await prisma.foodLog.deleteMany({ where: { clientId: client.id, date: today, slotLabel: d.slotLabel } });
    return NextResponse.json({ ok: true, logged: false });
  }

  // One row per slot per day — ticking twice shouldn't inflate adherence.
  await prisma.foodLog.deleteMany({ where: { clientId: client.id, date: today, slotLabel: d.slotLabel } });
  await prisma.foodLog.create({
    data: {
      clientId: client.id,
      date: today,
      slotLabel: d.slotLabel,
      source: d.source,
      customText: d.customText || null,
    },
  });

  return NextResponse.json({ ok: true, logged: true });
}
