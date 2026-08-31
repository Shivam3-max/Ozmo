import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStaff, canEditPlans } from "@/lib/auth";
import { CLINIC_ID } from "@/lib/leads";
import { asStrings } from "@/lib/json";
import { suggestTargets } from "@/lib/clients";
import { uid, type PlanDraft } from "@/lib/plan-types";
import PlanBuilder from "@/components/admin/PlanBuilder";
import { Panel } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function PlanBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  if (!canEditPlans(user.role)) {
    return <Panel className="px-6 py-8"><p className="text-[15px] text-[var(--ink-2)]">Plans aren&rsquo;t part of your role&rsquo;s access.</p></Panel>;
  }

  const { id } = await params;
  const plan = await prisma.dietPlan.findFirst({
    where: { id, client: { clinicId: CLINIC_ID } },
    include: {
      days: { orderBy: { index: "asc" }, include: { slots: { orderBy: { order: "asc" }, include: { items: { orderBy: { order: "asc" } } } } } },
      sections: { orderBy: { order: "asc" } },
      client: {
        include: {
          user: true,
          assessment: true,
          healthProfiles: { orderBy: { version: "desc" }, take: 1 },
        },
      },
    },
  });
  if (!plan) notFound();

  const [library, templates] = await Promise.all([
    prisma.food.findMany({
      where: { OR: [{ clinicId: CLINIC_ID }, { clinicId: null }] },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: { id: true, name: true, category: true, servingUnit: true, defaultType: true },
    }),
    prisma.planTemplate.findMany({ where: { clinicId: CLINIC_ID }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const c = plan.client;
  const a = c.assessment;

  const draft: PlanDraft = {
    title: plan.title,
    dayMode: plan.dayMode,
    dayCount: plan.dayCount,
    dietPreference: plan.dietPreference,
    conditionsNote: plan.conditionsNote,
    showTargets: plan.showTargets,
    targetCalories: plan.targetCalories,
    targetProtein: plan.targetProtein,
    targetCarbs: plan.targetCarbs,
    targetFat: plan.targetFat,
    days: plan.days.map((d) => ({
      id: d.id,
      index: d.index,
      label: d.label,
      slots: d.slots.map((s) => ({
        id: s.id,
        label: s.label,
        timeHint: s.timeHint ?? undefined,
        condition: s.condition ?? undefined,
        optionNote: s.optionNote ?? undefined,
        items: s.items.map((i) => ({
          id: i.id,
          type: i.type,
          text: i.text,
          quantity: i.quantity ?? undefined,
          prepNote: i.prepNote ?? undefined,
          optionGroup: i.optionGroup,
          foodId: i.foodId,
        })),
      })),
    })),
    sections: plan.sections.map((s) => ({
      id: s.id,
      kind: s.kind,
      title: s.title ?? undefined,
      items: asStrings(s.items),
    })),
  };
  if (draft.days.length === 0) draft.days = [{ id: uid(), index: 0, label: "Every day", slots: [] }];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link href={`/admin/clients/${c.id}`} className="text-[13.5px] text-[var(--ink-3)] hover:text-[var(--ink)]">
          ← {c.user.name}
        </Link>
        <span className="tabular rounded-full bg-[var(--tint)] px-3 py-1 text-[12px] font-semibold text-[var(--ink-2)]">
          v{plan.version} · {plan.status.toLowerCase()}
        </span>
      </div>

      <PlanBuilder
        planId={plan.id}
        initial={draft}
        client={{
          id: c.id,
          name: c.user.name,
          code: c.clientCode,
          goal: a?.goal ?? null,
          conditions: asStrings(c.healthProfiles[0]?.conditions ?? a?.conditions).filter((x) => x !== "None of these"),
          allergies: asStrings(c.allergies),
          dislikes: asStrings(c.dislikes),
          foodPreference: c.foodPreference,
          suggested: suggestTargets({
            weightKg: c.startWeightKg,
            heightCm: c.heightCm,
            age: a?.age ?? null,
            gender: c.gender,
            activity: a?.activityLevel ?? null,
            goal: a?.goal ?? null,
          }),
        }}
        library={library}
        templates={templates}
      />
    </>
  );
}
