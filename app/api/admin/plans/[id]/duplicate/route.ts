import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, canEditPlans } from "@/lib/auth";
import { CLINIC_ID } from "@/lib/leads";

export const runtime = "nodejs";

/**
 * Start the next version of a plan. She revises fortnightly, and the previous
 * version stays archived — plan history is part of the clinical record.
 */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !canEditPlans(session.role)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const source = await prisma.dietPlan.findFirst({
    where: { id, client: { clinicId: CLINIC_ID } },
    include: {
      days: { orderBy: { index: "asc" }, include: { slots: { orderBy: { order: "asc" }, include: { items: { orderBy: { order: "asc" } } } } } },
      sections: { orderBy: { order: "asc" } },
    },
  });
  if (!source) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

  const last = await prisma.dietPlan.findFirst({
    where: { clientId: source.clientId },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  const copy = await prisma.dietPlan.create({
    data: {
      client: { connect: { id: source.clientId } },
      ...(source.enrollmentId ? { enrollment: { connect: { id: source.enrollmentId } } } : {}),
      createdBy: { connect: { id: session.sub } },
      version: (last?.version ?? source.version) + 1,
      status: "DRAFT",
      title: source.title,
      dayMode: source.dayMode,
      dayCount: source.dayCount,
      dietPreference: source.dietPreference,
      conditionsNote: source.conditionsNote,
      showTargets: source.showTargets,
      targetCalories: source.targetCalories,
      targetProtein: source.targetProtein,
      targetCarbs: source.targetCarbs,
      targetFat: source.targetFat,
      days: {
        create: source.days.map((d) => ({
          index: d.index,
          label: d.label,
          slots: {
            create: d.slots.map((s, si) => ({
              label: s.label,
              timeHint: s.timeHint,
              condition: s.condition,
              optionNote: s.optionNote,
              order: si,
              items: {
                create: s.items.map((i, ii) => ({
                  type: i.type,
                  text: i.text,
                  quantity: i.quantity,
                  prepNote: i.prepNote,
                  optionGroup: i.optionGroup,
                  order: ii,
                })),
              },
            })),
          },
        })),
      },
      sections: {
        create: source.sections.map((sec, i) => ({
          kind: sec.kind,
          title: sec.title,
          items: sec.items ?? undefined,
          order: i,
        })),
      },
    },
  });

  return NextResponse.json({ ok: true, planId: copy.id }, { status: 201 });
}
