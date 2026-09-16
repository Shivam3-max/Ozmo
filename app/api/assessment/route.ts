import { NextResponse } from "next/server";
import { CLINIC_ID } from "@/lib/clinic";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { assessmentSchema, fieldErrors } from "@/lib/validation";
import { limitByIp } from "@/lib/rate-limit";
import { POLICY_VERSION, snapshotToken, scoreLead, earlierLeadWithPhone, flagPossibleDuplicate } from "@/lib/leads";
import { apiHandler } from "@/lib/api";
import { reportError } from "@/lib/observability";
import { afterAssessment } from "@/lib/notifications/public-forms";
import {
  computeBmi,
  buildCards,
  buildFocus,
  recommendProgram,
  requiresMedicalCaution,
  type Answers,
} from "@/lib/assessment";

export const runtime = "nodejs";

export const POST = apiHandler(async function POST(req: Request) {
  const limit = await limitByIp(req.headers, "assessment", 5, 60 * 60 * 1000);
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
  const num = (v: unknown) => (v === undefined || v === "" ? null : Number(v));

  try {
    // Anonymous submissions never edit an existing record — anyone can type a
    // phone number. A match is linked for staff to review instead.
    const lead = await prisma.$transaction(async (tx) => {
      const earlier = await earlierLeadWithPhone(tx, contact.phone);

      const created = await tx.lead.create({
        data: {
          clinicId: CLINIC_ID,
          phone: contact.phone,
          source: "ASSESSMENT",
          stage: "NEW",
          name: String(a.name ?? "").trim() || "Unnamed",
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
          consentService: true,
          consentMarketing: contact.consentMarketing,
          consentAt: new Date(),
          policyVersion: POLICY_VERSION,
          duplicateOfLeadId: earlier?.id ?? null,
          assessment: {
            create: {
              token,
              responses: answers as Prisma.InputJsonValue,
              age: num(a.age),
              gender: a.gender ? String(a.gender) : null,
              heightCm: num(a.height),
              weightKg: num(a.weight),
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
            },
          },
        },
      });

      await tx.leadActivity.create({
        data: { leadId: created.id, type: "ASSESSMENT_SUBMITTED", note: `Score ${created.score}, readiness ${readiness}/5` },
      });
      if (earlier) await flagPossibleDuplicate(tx, earlier.id, created, "assessment");
      return created;
    });

    await afterAssessment({ email: contact.email, token, leadId: lead.id, caution });

    return NextResponse.json({ ok: true, token }, { status: 201 });
  } catch (err) {
    await reportError(err, { source: "api", method: "POST", path: "/api/assessment" });
    return NextResponse.json(
      { error: "We couldn't save your answers. Please try again in a moment." },
      { status: 500 }
    );
  }
});
