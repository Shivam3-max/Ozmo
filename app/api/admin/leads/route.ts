import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authorize } from "@/lib/auth";
import { POLICY_VERSION, scoreLead } from "@/lib/leads";
import { phoneSchema } from "@/lib/validation";
import { apiHandler } from "@/lib/api";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: phoneSchema,
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  source: z.enum(["WALK_IN", "PHONE", "REFERRAL", "INSTAGRAM", "WHATSAPP", "GOOGLE_ADS", "OTHER"]),
  goal: z.string().trim().max(120).optional().or(z.literal("")),
  conditions: z.array(z.string().trim().max(80)).max(20).default([]),
  readiness: z.coerce.number().int().min(1).max(5).default(3),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const POST = apiHandler(async function POST(req: Request) {
  const session = await authorize("leads.manage");

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 422 });
  }
  const d = parsed.data;

  // Walk-ins and phone enquiries are often people who already filled the form.
  const existing = await prisma.lead.findFirst({
    where: { clinicId: session.clinicId, phone: d.phone },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    return NextResponse.json(
      { error: `${existing.name} is already on file with that number.`, leadId: existing.id },
      { status: 409 }
    );
  }

  const lead = await prisma.$transaction(async (tx) => {
  const created = await tx.lead.create({
    data: {
      clinicId: session.clinicId,
      name: d.name,
      phone: d.phone,
      email: d.email || null,
      city: d.city || null,
      source: d.source,
      stage: "CONTACTED",
      goal: d.goal || null,
      conditions: d.conditions,
      readiness: d.readiness,
      requiresMedicalCaution: d.conditions.some((c) =>
        ["Heart condition", "Kidney condition", "Currently pregnant"].includes(c)
      ),
      score: scoreLead({
        readiness: d.readiness,
        conditionCount: d.conditions.length,
        hasGoal: Boolean(d.goal),
        hasReports: false,
      }),
      // Consent for someone entered by staff is recorded as given in person.
      consentService: true,
      consentAt: new Date(),
      policyVersion: POLICY_VERSION,
      assignedToId: session.sub,
    },
  });

  await tx.leadActivity.create({
    data: { leadId: created.id, type: "ADDED_MANUALLY", note: `${d.source.replace(/_/g, " ").toLowerCase()} — added by ${session.name}`, staffId: session.sub },
  });
  if (d.note) await tx.leadActivity.create({ data: { leadId: created.id, type: "NOTE", note: d.note, staffId: session.sub } });
  return created;
  });

  return NextResponse.json({ ok: true, leadId: lead.id }, { status: 201 });
});
