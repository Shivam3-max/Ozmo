import { prisma } from "@/lib/db";
import { asObject, asStrings } from "@/lib/json";
import { planWarnings } from "@/lib/plan-types";
import { conflict, invalid, notFound } from "@/lib/errors";
import { audit, type Actor } from "@/lib/services/audit";
import { canonicalSections, diffDays, type DayInput, type PlanSave } from "@/lib/services/plan-diff";

const dayCreate = (d: DayInput) => ({
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
});

const fullPlanInclude = {
  days: { orderBy: { index: "asc" as const }, include: { slots: { orderBy: { order: "asc" as const }, include: { items: { orderBy: { order: "asc" as const } } } } } },
  sections: { orderBy: { order: "asc" as const } },
};

/** A new plan for a client: blank, or copied from a template. */
export async function createPlan(actor: Actor, input: { clientId: string; templateId?: string; title?: string }) {
  const client = await prisma.client.findFirst({
    where: { id: input.clientId, clinicId: actor.clinicId, deletedAt: null },
    include: { user: true, enrollments: { orderBy: { startDate: "desc" }, take: 1 } },
  });
  if (!client) throw notFound("Client");

  let structure: { dayMode?: "SINGLE" | "WEEK" | "SEQUENCE"; dayCount?: number; days?: DayInput[]; sections?: { kind: "GUIDELINES" | "NOTES"; title?: string; items: string[] }[] } = {};
  let title = input.title ?? `Plan for ${client.user.name}`;
  if (input.templateId) {
    const tpl = await prisma.planTemplate.findFirst({ where: { id: input.templateId, clinicId: actor.clinicId } });
    if (!tpl) throw notFound("Template");
    structure = asObject(tpl.structure);
    title = input.title ?? tpl.name;
  }
  const days: DayInput[] = structure.days?.length ? structure.days : [{ index: 0, label: "Every day", slots: [] }];

  return prisma.$transaction(async (tx) => {
    const last = await tx.dietPlan.findFirst({ where: { clientId: client.id }, orderBy: { version: "desc" }, select: { version: true } });
    const plan = await tx.dietPlan.create({
      data: {
        client: { connect: { id: client.id } },
        ...(client.enrollments[0] ? { enrollment: { connect: { id: client.enrollments[0].id } } } : {}),
        createdBy: { connect: { id: actor.sub } },
        version: (last?.version ?? 0) + 1,
        title,
        dayMode: structure.dayMode ?? "SINGLE",
        dayCount: structure.dayCount ?? 1,
        dietPreference: client.foodPreference,
        days: { create: days.map((d) => dayCreate({ ...d, slots: d.slots.map((s) => ({ ...s, items: s.items ?? [] })) })) },
        sections: { create: (structure.sections ?? []).map((sec, i) => ({ kind: sec.kind, title: sec.title ?? null, items: sec.items, order: i })) },
      },
    });
    if (input.templateId) await tx.planTemplate.update({ where: { id: input.templateId }, data: { timesUsed: { increment: 1 } } });
    await audit(tx, actor, "PLAN_CREATED", { type: "DietPlan", id: plan.id }, { clientId: client.id, fromTemplate: Boolean(input.templateId) });
    return plan;
  });
}

/**
 * Saves a draft. Only days whose content changed are rewritten; publishing
 * archives the client's previous active plan in the same transaction.
 */
export async function savePlan(actor: Actor, planId: string, p: PlanSave) {
  const existing = await prisma.dietPlan.findFirst({
    where: { id: planId, client: { clinicId: actor.clinicId } },
    include: { client: true, ...fullPlanInclude },
  });
  if (!existing) throw notFound("Plan");

  // A published or archived plan is part of the clinical record and may be what
  // the client is following today. It is never edited in place.
  if (existing.status !== "DRAFT") {
    throw conflict("This version is already published. Start a new version to make changes.", { code: "NOT_DRAFT" });
  }
  const expected = new Date(p.expectedUpdatedAt);
  if (Number.isNaN(expected.getTime()) || expected.getTime() !== existing.updatedAt.getTime()) {
    throw conflict("This plan was saved from another tab or by someone else. Reload to see the latest version.", { code: "STALE" });
  }

  const foodIds = [...new Set(p.days.flatMap((d) => d.slots.flatMap((s) => s.items.map((i) => i.foodId).filter(Boolean))))] as string[];
  if (foodIds.length) {
    const allowed = await prisma.food.count({ where: { id: { in: foodIds }, clinicId: actor.clinicId } });
    if (allowed !== foodIds.length) throw invalid("One or more food-library links are invalid.");
  }

  // The editor shows these as blocking, but only the server's check counts.
  if (p.publish) {
    const blockers = planWarnings(p, {
      allergies: asStrings(existing.client.allergies),
      dislikes: asStrings(existing.client.dislikes),
      foodPreference: existing.client.foodPreference,
    }).filter((w) => w.severity === "block");
    if (blockers.length) {
      throw invalid(`Can't publish: ${blockers.slice(0, 3).map((b) => `${b.reason} — ${b.item}`).join("; ")}`, { code: "BLOCKED" });
    }
  }

  const changes = diffDays(existing.days, p.days);
  const sectionsChanged = canonicalSections(existing.sections) !== canonicalSections(p.sections);

  const saved = await prisma.$transaction(async (tx) => {
    // Compare-and-set inside the transaction so two saves that both passed the
    // check above can't both win.
    const claimed = await tx.dietPlan.updateMany({
      where: { id: planId, status: "DRAFT", updatedAt: existing.updatedAt },
      data: { updatedAt: new Date() },
    });
    if (claimed.count !== 1) {
      throw conflict("This plan was saved from another tab or by someone else. Reload to see the latest version.", { code: "STALE" });
    }

    const rewrite = [...changes.replace.map((d) => d.index), ...changes.remove];
    if (rewrite.length) await tx.planDay.deleteMany({ where: { planId, index: { in: rewrite } } });
    for (const day of [...changes.create, ...changes.replace]) {
      await tx.planDay.create({ data: { planId, ...dayCreate(day) } });
    }
    if (sectionsChanged) {
      await tx.planSection.deleteMany({ where: { planId } });
      if (p.sections.length) {
        await tx.planSection.createMany({
          data: p.sections.map((sec, i) => ({ planId, kind: sec.kind, title: sec.title ?? null, items: sec.items, order: i })),
        });
      }
    }

    if (p.publish) {
      await tx.dietPlan.updateMany({
        where: { clientId: existing.clientId, status: "ACTIVE", id: { not: planId } },
        data: { status: "ARCHIVED", archivedAt: new Date() },
      });
    }
    const updated = await tx.dietPlan.update({
      where: { id: planId },
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
      },
    });
    // Publishing supersedes the previous active plan rather than deleting it —
    // the history is part of the clinical record.
    if (p.publish) {
      await audit(tx, actor, "PLAN_PUBLISHED", { type: "DietPlan", id: planId }, { version: existing.version, clientId: existing.clientId });
    }
    return updated;
  }, { isolationLevel: "Serializable" });

  return {
    updatedAt: saved.updatedAt,
    published: Boolean(p.publish),
    written: { days: changes.create.length + changes.replace.length, removed: changes.remove.length, unchanged: changes.unchanged, sections: sectionsChanged },
  };
}

/**
 * The next version of a plan, as a draft. Opening "edit" on a live plan twice
 * reuses the draft already in progress instead of piling up copies.
 */
export async function duplicatePlan(actor: Actor, planId: string) {
  const source = await prisma.dietPlan.findFirst({ where: { id: planId, client: { clinicId: actor.clinicId } }, include: fullPlanInclude });
  if (!source) throw notFound("Plan");

  const openDraft = await prisma.dietPlan.findFirst({
    where: { clientId: source.clientId, status: "DRAFT", version: { gt: source.version } },
    orderBy: { version: "desc" },
    select: { id: true },
  });
  if (openDraft) return { planId: openDraft.id, reused: true };

  const copy = await prisma.$transaction(async (tx) => {
    const last = await tx.dietPlan.findFirst({ where: { clientId: source.clientId }, orderBy: { version: "desc" }, select: { version: true } });
    const created = await tx.dietPlan.create({
      data: {
        client: { connect: { id: source.clientId } },
        ...(source.enrollmentId ? { enrollment: { connect: { id: source.enrollmentId } } } : {}),
        createdBy: { connect: { id: actor.sub } },
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
        days: { create: source.days.map((d) => dayCreate(d)) },
        sections: { create: source.sections.map((sec, i) => ({ kind: sec.kind, title: sec.title, items: sec.items ?? undefined, order: i })) },
      },
    });
    await audit(tx, actor, "PLAN_VERSION_STARTED", { type: "DietPlan", id: created.id }, { fromPlanId: source.id });
    return created;
  });
  return { planId: copy.id, reused: false };
}
