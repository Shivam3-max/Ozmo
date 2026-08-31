import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, canEditPlans } from "@/lib/auth";
import { CLINIC_ID } from "@/lib/leads";
import { nextClientCode, MEAL_SLOTS } from "@/lib/clients";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z.string().trim().min(8, "Phone is required").max(20),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  gender: z.string().trim().max(30).optional().or(z.literal("")),
  age: z.coerce.number().int().min(5).max(110).optional().nullable(),
  heightCm: z.coerce.number().min(60).max(250).optional().nullable(),
  weightKg: z.coerce.number().min(20).max(300).optional().nullable(),
  foodPreference: z.string().trim().max(60).optional().or(z.literal("")),
  allergies: z.array(z.string().trim().max(80)).max(30).default([]),
  conditions: z.array(z.string().trim().max(80)).max(30).default([]),
  programSlug: z.string().trim().min(1, "Choose a programme"),
  durationMonths: z.coerce.number().int().min(1).max(24),
});

/** Add a client directly — for people who walk in and sign up on the spot. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !canEditPlans(session.role)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 422 });
  }
  const d = parsed.data;

  const email = d.email || `${d.phone}@no-email.ozmo.local`;
  if (await prisma.user.findUnique({ where: { email } })) {
    return NextResponse.json({ error: "Someone already has that email or phone on file." }, { status: 409 });
  }

  const program = await prisma.program.findUnique({
    where: { clinicId_slug: { clinicId: CLINIC_ID, slug: d.programSlug } },
  });
  if (!program) return NextResponse.json({ error: "Programme not found." }, { status: 404 });

  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + d.durationMonths);

  const dob = d.age ? new Date(start.getFullYear() - d.age, start.getMonth(), start.getDate()) : null;

  const client = await prisma.client.create({
    data: {
      clinic: { connect: { id: CLINIC_ID } },
      clientCode: await nextClientCode(),
      user: { create: { clinicId: CLINIC_ID, role: "CLIENT" as const, name: d.name, email, phone: d.phone } },
      dob,
      gender: d.gender || null,
      city: d.city || null,
      heightCm: d.heightCm ?? null,
      startWeightKg: d.weightKg ?? null,
      foodPreference: d.foodPreference || null,
      allergies: d.allergies,
      primaryDietitian: { connect: { id: session.sub } },
      mealTimes: Object.fromEntries(MEAL_SLOTS.map((m) => [m.slot, m.time])),
      enrollments: {
        create: {
          program: { connect: { id: program.id } },
          durationMonths: d.durationMonths,
          startDate: start,
          endDate: end,
          followUpsIncluded: d.durationMonths * 2,
          reportsIncluded: d.durationMonths,
        },
      },
      healthProfiles: { create: { conditions: d.conditions, notes: `Added directly by ${session.name}.` } },
      ...(d.weightKg ? { measurements: { create: { weightKg: d.weightKg, date: start, note: "At sign-up" } } } : {}),
      thread: { create: {} },
    },
  });

  await prisma.auditLog.create({
    data: {
      clinicId: CLINIC_ID,
      actorId: session.sub,
      action: "CLIENT_CREATED_MANUALLY",
      entityType: "Client",
      entityId: client.id,
      changes: { program: program.slug, months: d.durationMonths },
    },
  });

  return NextResponse.json({ ok: true, clientId: client.id }, { status: 201 });
}
