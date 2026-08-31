import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, canEditPlans } from "@/lib/auth";
import { CLINIC_ID, logLeadActivity } from "@/lib/leads";
import { nextClientCode, MEAL_SLOTS } from "@/lib/clients";

export const runtime = "nodejs";

const schema = z.object({
  programSlug: z.string().trim().min(1),
  durationMonths: z.coerce.number().int().min(1).max(24),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !canEditPlans(session.role)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a programme and duration." }, { status: 422 });

  const lead = await prisma.lead.findFirst({
    where: { id, clinicId: CLINIC_ID },
    include: { assessment: true },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  if (lead.convertedClientId) {
    return NextResponse.json({ error: "This lead is already a client.", clientId: lead.convertedClientId }, { status: 409 });
  }

  const program = await prisma.program.findUnique({
    where: { clinicId_slug: { clinicId: CLINIC_ID, slug: parsed.data.programSlug } },
  });
  if (!program) return NextResponse.json({ error: "Programme not found." }, { status: 404 });

  // A lead may have signed up with an email we already hold — don't collide.
  const email = lead.email ?? `${lead.phone}@no-email.ozmo.local`;
  if (await prisma.user.findUnique({ where: { email } })) {
    return NextResponse.json({ error: "A user already exists with that email." }, { status: 409 });
  }

  const a = lead.assessment;
  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + parsed.data.durationMonths);

  const client = await prisma.client.create({
    data: {
      clinic: { connect: { id: CLINIC_ID } },
      clientCode: await nextClientCode(),
      // No password yet — the client sets one when the portal invite goes out.
      user: {
        create: { clinicId: CLINIC_ID, role: "CLIENT" as const, name: lead.name, email, phone: lead.phone },
      },
      gender: a?.gender ?? null,
      city: lead.city,
      heightCm: a?.heightCm ?? null,
      startWeightKg: a?.weightKg ?? null,
      foodPreference: a?.foodPreference ?? null,
      primaryDietitian: { connect: { id: session.sub } },
      mealTimes: Object.fromEntries(MEAL_SLOTS.map((m) => [m.slot, m.time])),
      enrollments: {
        create: {
          program: { connect: { id: program.id } },
          durationMonths: parsed.data.durationMonths,
          startDate: start,
          endDate: end,
          followUpsIncluded: parsed.data.durationMonths * 2,
          reportsIncluded: parsed.data.durationMonths,
        },
      },
      ...(a ? { assessment: { connect: { id: a.id } } } : {}),
      ...(a
        ? {
            healthProfiles: {
              create: {
                conditions: a.conditions ?? undefined,
                notes: "Carried over from the health assessment at conversion.",
              },
            },
          }
        : {}),
      // Start the weight history at the assessment reading so progress has a baseline.
      ...(a?.weightKg
        ? { measurements: { create: { weightKg: a.weightKg, date: start, note: "From health assessment" } } }
        : {}),
      thread: { create: {} },
    },
  });

  await prisma.lead.update({
    where: { id },
    data: { stage: "CONVERTED", convertedClientId: client.id },
  });
  await logLeadActivity(id, "CONVERTED", `${program.name} · ${parsed.data.durationMonths} months`, session.sub);
  await prisma.auditLog.create({
    data: {
      clinicId: CLINIC_ID,
      actorId: session.sub,
      action: "LEAD_CONVERTED",
      entityType: "Client",
      entityId: client.id,
      changes: { leadId: id, program: program.slug },
    },
  });

  return NextResponse.json({ ok: true, clientId: client.id }, { status: 201 });
}
