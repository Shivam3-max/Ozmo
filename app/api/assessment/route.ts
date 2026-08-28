import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { assessmentSchema, fieldErrors } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { CLINIC_ID, POLICY_VERSION, snapshotToken, scoreLead, logLeadActivity, notifyClinic } from "@/lib/leads";
import {
  computeBmi,
  buildCards,
  buildFocus,
  recommendProgram,
  requiresMedicalCaution,
  type Answers,
} from "@/lib/assessment";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limit = rateLimit(`assessment:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = assessmentSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your answers.", fields: fieldErrors(parsed.error) }, { status: 422 });
  }

  const { answers, contact } = parsed.data;
  const a = answers as Answers;

  // The Snapshot is recomputed here rather than trusted from the browser — the
  // client-side copy is for instant display only.
  const bmi = computeBmi(a);
  const cards = buildCards(a);
  const focus = buildFocus(a);
  const program = recommendProgram(a);
  const caution = requiresMedicalCaution(a);

  const conditions = Array.isArray(a.conditions) ? (a.conditions as string[]) : [];
  const readinessIndex = [
    "Just exploring for now",
    "Thinking about it",
    "Fairly serious",
    "Ready to start",
    "I need to start immediately",
  ].indexOf(String(a.readiness ?? ""));
  const readiness = readinessIndex + 1;

  const token = snapshotToken();

  try {
    // Someone who books first and takes the assessment afterwards is one person,
    // not two leads. Reuse the existing record for this phone.
    const existing = await prisma.lead.findFirst({
      where: { clinicId: CLINIC_ID, phone: contact.phone },
      orderBy: { createdAt: "desc" },
      include: { assessment: true },
    });

    const leadFields = {
      name: String(a.name ?? "").trim() || existing?.name || "Unnamed",
      email: contact.email,
      city: contact.city || null,
      goal: a.goal ? String(a.goal) : null,
      conditions,
      readiness,
      requiresMedicalCaution: caution,
      score: scoreLead({
        readiness,
        conditionCount: conditions.filter((c) => c !== "None of these").length,
        hasGoal: Boolean(a.goal) && a.goal !== "Not sure yet",
        hasReports: a.bloodTests === "Yes, and I have the reports",
      }),
      consentMarketing: contact.consentMarketing,
      consentAt: new Date(),
      policyVersion: POLICY_VERSION,
    };

    const assessmentFields = {
      token,
      responses: answers as Prisma.InputJsonValue,
      age: a.age ? Number(a.age) : null,
      gender: a.gender ? String(a.gender) : null,
      heightCm: a.height ? Number(a.height) : null,
      weightKg: a.weight ? Number(a.weight) : null,
      bmi,
      goal: a.goal ? String(a.goal) : null,
      activityLevel: a.activity ? String(a.activity) : null,
      conditions,
      foodPreference: a.foodPreference ? String(a.foodPreference) : null,
      readiness,
      snapshotCards: cards as unknown as Prisma.InputJsonValue,
      snapshotFocus: focus as unknown as Prisma.InputJsonValue,
      recommendedProgram: program.slug,
      requiresMedicalCaution: caution,
      completedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    let lead;
    if (existing) {
      lead = await prisma.lead.update({
        where: { id: existing.id },
        data: {
          ...leadFields,
          // never drag a lead backwards through the pipeline on a retake
          stage: existing.stage === "NEW" ? "NEW" : existing.stage,
          assessment: existing.assessment
            ? { update: assessmentFields }
            : { create: assessmentFields },
        },
      });
    } else {
      lead = await prisma.lead.create({
        data: {
          clinicId: CLINIC_ID,
          phone: contact.phone,
          source: "ASSESSMENT",
          stage: "NEW",
          consentService: true,
          ...leadFields,
          assessment: { create: assessmentFields },
        },
      });
    }

    await logLeadActivity(
      lead.id,
      existing ? "ASSESSMENT_RETAKEN" : "ASSESSMENT_SUBMITTED",
      `Score ${lead.score}, readiness ${readiness}/5`
    );
    await notifyClinic(
      `New assessment — ${lead.name}${caution ? " (MEDICAL CAUTION)" : ""}`,
      `${lead.name} · ${lead.phone} · score ${lead.score}\nGoal: ${lead.goal ?? "—"}\nConditions: ${conditions.join(", ") || "none"}`
    );

    return NextResponse.json({ ok: true, token }, { status: 201 });
  } catch (err) {
    console.error("[ozmo] assessment save failed", err);
    return NextResponse.json(
      { error: "We couldn't save your answers. Please try again in a moment." },
      { status: 500 }
    );
  }
}
