import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, canEditPlans } from "@/lib/auth";
import { CLINIC_ID } from "@/lib/leads";
import { foodSchema } from "@/lib/food-schema";

export const runtime = "nodejs";

/** Full edit, or a one-field verify toggle from the list. */
const patchSchema = z.union([
  foodSchema.partial().extend({ _mode: z.literal("full").optional() }),
  z.object({ isVerified: z.boolean(), _mode: z.literal("verify") }),
]);

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !canEditPlans(session.role)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the values." }, { status: 422 });
  }

  const existing = await prisma.food.findFirst({ where: { id, OR: [{ clinicId: CLINIC_ID }, { clinicId: null }] } });
  if (!existing) return NextResponse.json({ error: "Item not found." }, { status: 404 });

  const { _mode, ...data } = parsed.data as Record<string, unknown> & { _mode?: string };

  const food = await prisma.food.update({
    where: { id },
    data: { ...data, ...(("glycemicTag" in data && !data.glycemicTag) ? { glycemicTag: null } : {}) },
  });

  await prisma.auditLog.create({
    data: {
      clinicId: CLINIC_ID, actorId: session.sub,
      action: _mode === "verify" ? "FOOD_VERIFIED" : "FOOD_UPDATED",
      entityType: "Food", entityId: id, changes: { name: food.name },
    },
  });

  return NextResponse.json({ ok: true, isVerified: food.isVerified });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !canEditPlans(session.role)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const food = await prisma.food.findFirst({ where: { id, OR: [{ clinicId: CLINIC_ID }, { clinicId: null }] } });
  if (!food) return NextResponse.json({ error: "Item not found." }, { status: 404 });

  // Deleting a food that a published plan points at would silently gut the plan.
  const used = await prisma.planItem.count({ where: { foodId: id } });
  if (used > 0) {
    return NextResponse.json(
      { error: `"${food.name}" is used in ${used} plan ${used === 1 ? "row" : "rows"}. Rename or edit it instead of deleting.` },
      { status: 409 }
    );
  }

  await prisma.food.delete({ where: { id } });
  await prisma.auditLog.create({
    data: {
      clinicId: CLINIC_ID, actorId: session.sub, action: "FOOD_DELETED",
      entityType: "Food", entityId: id, changes: { name: food.name },
    },
  });

  return NextResponse.json({ ok: true });
}
