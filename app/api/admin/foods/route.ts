import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorize } from "@/lib/auth";
import { foodSchema } from "@/lib/food-schema";
import { apiHandler } from "@/lib/api";

export const runtime = "nodejs";

export const POST = apiHandler(async function POST(req: Request) {
  const session = await authorize("foods.edit");

  const parsed = foodSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the values." }, { status: 422 });
  }
  const d = parsed.data;

  const clash = await prisma.food.findFirst({
    where: { clinicId: session.clinicId, name: { equals: d.name } },
  });
  if (clash) {
    return NextResponse.json({ error: `"${d.name}" is already in the library.`, foodId: clash.id }, { status: 409 });
  }

  const food = await prisma.food.create({
    data: {
      clinicId: session.clinicId,
      ...d,
      glycemicTag: d.glycemicTag ?? null,
      // Anything the dietitian types herself is verified by definition.
      isVerified: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      clinicId: session.clinicId, actorId: session.sub, action: "FOOD_CREATED",
      entityType: "Food", entityId: food.id, changes: { name: food.name },
    },
  });

  return NextResponse.json({ ok: true, foodId: food.id }, { status: 201 });
});
