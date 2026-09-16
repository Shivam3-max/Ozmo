import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authorize } from "@/lib/auth";
import { todaysPlan } from "@/lib/portal";
import { clinicDay } from "@/lib/clinic-time";
import { apiHandler } from "@/lib/api";

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
  const session = await authorize("portal.self");
  return prisma.client.findFirst({
    where: { userId: session.sub, deletedAt: null },
    select: { id: true, joinedAt: true, enrollments: { orderBy: { startDate: "desc" }, take: 1, select: { startDate: true } } },
  });
}

export const POST = apiHandler(async function POST(req: Request) {
  const client = await clientForSession();
  if (!client) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Couldn't record that." }, { status: 422 });

  // The clinic's calendar day, not the server's — see lib/clinic-time.ts.
  const today = clinicDay();
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

  // A meal can only be ticked against a row in today's plan, so the score
  // can't be padded with invented slots.
  const plan = await todaysPlan(client.id, client.enrollments[0]?.startDate ?? client.joinedAt);
  if (!plan || !plan.slots.some((slot) => slot.label === d.slotLabel)) {
    return NextResponse.json({ error: "That meal isn't in today's plan. Refresh to see the latest version." }, { status: 422 });
  }

  // The database constraint makes repeated/concurrent ticks idempotent.
  await prisma.foodLog.upsert({
    where: { clientId_date_slotLabel: { clientId: client.id, date: today, slotLabel: d.slotLabel } },
    update: { source: d.source, customText: d.customText || null },
    create: {
      clientId: client.id,
      date: today,
      slotLabel: d.slotLabel,
      source: d.source,
      customText: d.customText || null,
    },
  });

  return NextResponse.json({ ok: true, logged: true });
});
