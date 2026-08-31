import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, canEditPlans } from "@/lib/auth";
import { CLINIC_ID } from "@/lib/leads";

export const runtime = "nodejs";

const itemSchema = z.object({
  type: z.enum(["FOOD", "SUPPLEMENT", "EXERCISE", "BREATHWORK", "LIFESTYLE", "HYDRATION", "PREP", "NOTE"]),
  text: z.string().trim().min(1).max(2000),
  quantity: z.string().trim().max(200).nullish(),
  prepNote: z.string().trim().max(500).nullish(),
  optionGroup: z.number().int().nullish(),
  foodId: z.string().max(40).nullish(),
});

const slotSchema = z.object({
  label: z.string().trim().min(1).max(160),
  timeHint: z.string().trim().max(80).nullish(),
  condition: z.string().trim().max(160).nullish(),
  optionNote: z.string().trim().max(200).nullish(),
  items: z.array(itemSchema).max(60),
});

const saveSchema = z.object({
  title: z.string().trim().min(1).max(200),
  dayMode: z.enum(["SINGLE", "WEEK", "SEQUENCE"]),
  dayCount: z.number().int().min(1).max(90),
  dietPreference: z.string().trim().max(80).nullish(),
  conditionsNote: z.string().trim().max(300).nullish(),
  showTargets: z.boolean(),
  targetCalories: z.number().int().min(0).max(6000).nullish(),
  targetProtein: z.number().int().min(0).max(400).nullish(),
  targetCarbs: z.number().int().min(0).max(900).nullish(),
  targetFat: z.number().int().min(0).max(400).nullish(),
  days: z.array(z.object({
    index: z.number().int().min(-1).max(90),
    label: z.string().trim().min(1).max(80),
    slots: z.array(slotSchema).max(40),
  })).max(91),
  sections: z.array(z.object({
    kind: z.enum(["GUIDELINES", "NOTES"]),
    title: z.string().trim().max(160).nullish(),
    items: z.array(z.string().trim().max(600)).max(40),
  })).max(6),
  publish: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !canEditPlans(session.role)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const parsed = saveSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Couldn't save — some values were rejected.", issues: parsed.error.issues.slice(0, 5) }, { status: 422 });
  }
  const p = parsed.data;

  const existing = await prisma.dietPlan.findFirst({
    where: { id, client: { clinicId: CLINIC_ID } },
    include: { client: true },
  });
  if (!existing) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

  // Rewriting days wholesale is simpler and safer than diffing a nested tree,
  // and a plan is small enough that the cost is irrelevant.
  await prisma.$transaction([
    prisma.planDay.deleteMany({ where: { planId: id } }),
    prisma.planSection.deleteMany({ where: { planId: id } }),
    prisma.dietPlan.update({
      where: { id },
      data: {
        title: p.title,
        dayMode: p.dayMode,
        dayCount: p.dayCount,
        dietPreference: p.dietPreference ?? null,
        conditionsNote: p.conditionsNote ?? null,
        showTargets: p.showTargets,
        targetCalories: p.targetCalories ?? null,
        targetProtein: p.targetProtein ?? null,
        targetCarbs: p.targetCarbs ?? null,
        targetFat: p.targetFat ?? null,
        ...(p.publish ? { status: "ACTIVE" as const, publishedAt: new Date() } : {}),
        days: {
          create: p.days.map((d) => ({
            index: d.index,
            label: d.label,
            slots: {
              create: d.slots.map((sl, si) => ({
                label: sl.label,
                timeHint: sl.timeHint ?? null,
                condition: sl.condition ?? null,
                optionNote: sl.optionNote ?? null,
                order: si,
                items: {
                  create: sl.items.map((it, ii) => ({
                    type: it.type,
                    text: it.text,
                    quantity: it.quantity ?? null,
                    prepNote: it.prepNote ?? null,
                    optionGroup: it.optionGroup ?? null,
                    foodId: it.foodId ?? null,
                    order: ii,
                  })),
                },
              })),
            },
          })),
        },
        sections: {
          create: p.sections.map((sec, i) => ({
            kind: sec.kind,
            title: sec.title ?? null,
            items: sec.items,
            order: i,
          })),
        },
      },
    }),
  ]);

  // Publishing supersedes the previous active plan rather than deleting it —
  // the history is part of the clinical record.
  if (p.publish) {
    await prisma.dietPlan.updateMany({
      where: { clientId: existing.clientId, status: "ACTIVE", id: { not: id } },
      data: { status: "ARCHIVED", archivedAt: new Date() },
    });
    await prisma.auditLog.create({
      data: {
        clinicId: CLINIC_ID,
        actorId: session.sub,
        action: "PLAN_PUBLISHED",
        entityType: "DietPlan",
        entityId: id,
        changes: { version: existing.version, clientId: existing.clientId },
      },
    });
  }

  return NextResponse.json({ ok: true, published: Boolean(p.publish) });
}
