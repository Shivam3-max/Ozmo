import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, canEditPlans } from "@/lib/auth";
import { CLINIC_ID } from "@/lib/leads";
import { asObject } from "@/lib/json";

export const runtime = "nodejs";

const createSchema = z.object({
  clientId: z.string().min(1),
  templateId: z.string().optional(),
  title: z.string().trim().min(1).max(200).optional(),
});

type TplDay = { index: number; label: string; slots: unknown[] };

/** Create a plan — blank, from a template, or as the next version of the last one. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !canEditPlans(session.role)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Missing client." }, { status: 422 });
  const { clientId, templateId, title } = parsed.data;

  const client = await prisma.client.findFirst({
    where: { id: clientId, clinicId: CLINIC_ID },
    include: { user: true, enrollments: { orderBy: { startDate: "desc" }, take: 1 } },
  });
  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  const last = await prisma.dietPlan.findFirst({
    where: { clientId },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  let structure: {
    dayMode?: "SINGLE" | "WEEK" | "SEQUENCE";
    dayCount?: number;
    days?: TplDay[];
    sections?: { kind: "GUIDELINES" | "NOTES"; title?: string; items: string[] }[];
  } = {};
  let planTitle = title ?? `Plan for ${client.user.name}`;

  if (templateId) {
    const tpl = await prisma.planTemplate.findFirst({ where: { id: templateId, clinicId: CLINIC_ID } });
    if (!tpl) return NextResponse.json({ error: "Template not found." }, { status: 404 });
    structure = asObject(tpl.structure);
    planTitle = title ?? tpl.name;
    await prisma.planTemplate.update({ where: { id: tpl.id }, data: { timesUsed: { increment: 1 } } });
  }

  const days = structure.days?.length ? structure.days : [{ index: 0, label: "Every day", slots: [] }];

  const plan = await prisma.dietPlan.create({
    data: {
      client: { connect: { id: clientId } },
      ...(client.enrollments[0] ? { enrollment: { connect: { id: client.enrollments[0].id } } } : {}),
      createdBy: { connect: { id: session.sub } },
      version: (last?.version ?? 0) + 1,
      title: planTitle,
      dayMode: structure.dayMode ?? "SINGLE",
      dayCount: structure.dayCount ?? 1,
      dietPreference: client.foodPreference,
      days: {
        create: days.map((d) => ({
          index: d.index,
          label: d.label,
          slots: {
            create: (d.slots as {
              label: string; timeHint?: string; condition?: string; optionNote?: string;
              items?: { type: string; text: string; quantity?: string; optionGroup?: number }[];
            }[]).map((sl, si) => ({
              label: sl.label,
              timeHint: sl.timeHint ?? null,
              condition: sl.condition ?? null,
              optionNote: sl.optionNote ?? null,
              order: si,
              items: {
                create: (sl.items ?? []).map((it, ii) => ({
                  type: it.type as "FOOD",
                  text: it.text,
                  quantity: it.quantity ?? null,
                  optionGroup: it.optionGroup ?? null,
                  order: ii,
                })),
              },
            })),
          },
        })),
      },
      sections: {
        create: (structure.sections ?? []).map((sec, i) => ({
          kind: sec.kind,
          title: sec.title ?? null,
          items: sec.items,
          order: i,
        })),
      },
    },
  });

  return NextResponse.json({ ok: true, planId: plan.id }, { status: 201 });
}
