import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { bookingSchema, fieldErrors } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { CLINIC_ID, POLICY_VERSION, scoreLead, logLeadActivity, notifyClinic } from "@/lib/leads";

export const runtime = "nodejs";

/** "Fri 12 Sep" + "17:15" → a Date in the next 12 months. */
function parseSlot(dateLabel: string, time: string): Date | null {
  const m = dateLabel.match(/(\d{1,2})\s+([A-Za-z]{3})/);
  const t = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!m || !t) return null;
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const month = months.indexOf(m[2].toLowerCase().slice(0, 3));
  if (month < 0) return null;

  const now = new Date();
  let year = now.getFullYear();
  let d = new Date(year, month, Number(m[1]), Number(t[1]), Number(t[2]), 0, 0);
  if (d.getTime() < now.getTime() - 24 * 60 * 60 * 1000) d = new Date(++year, month, Number(m[1]), Number(t[1]), Number(t[2]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limit = rateLimit(`booking:${ip}`, 6, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many booking attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form.", fields: fieldErrors(parsed.error) }, { status: 422 });
  }

  const b = parsed.data;
  const scheduledAt = parseSlot(b.date, b.time);
  if (!scheduledAt) {
    return NextResponse.json({ error: "That slot didn't look right. Please pick again." }, { status: 422 });
  }

  try {
    // Reuse an existing lead for this phone rather than creating duplicates.
    const existing = await prisma.lead.findFirst({
      where: { clinicId: CLINIC_ID, phone: b.phone },
      orderBy: { createdAt: "desc" },
    });

    const lead =
      existing ??
      (await prisma.lead.create({
        data: {
          clinicId: CLINIC_ID,
          name: b.name,
          email: b.email,
          phone: b.phone,
          source: "BOOKING",
          stage: "CONSULTATION_BOOKED",
          goal: b.reason,
          readiness: 4,
          score: scoreLead({ readiness: 4, conditionCount: 0, hasGoal: true, hasReports: false }),
          consentService: true,
          consentAt: new Date(),
          policyVersion: POLICY_VERSION,
        },
      }));

    if (existing) {
      await prisma.lead.update({
        where: { id: existing.id },
        data: { stage: "CONSULTATION_BOOKED", email: existing.email ?? b.email },
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        leadId: lead.id,
        type: b.type === "followup" ? "FOLLOW_UP" : "INITIAL",
        mode: b.type === "video" ? "VIDEO" : "IN_CLINIC",
        status: "SCHEDULED",
        scheduledAt,
        durationMin: b.type === "followup" ? 30 : 60,
        reason: b.reason,
        notes: b.notes || null,
      },
    });

    await logLeadActivity(lead.id, "BOOKING_CREATED", `${b.date} ${b.time} · ${b.type}`);
    await notifyClinic(
      `New booking — ${b.name}`,
      `${b.date} at ${b.time} (${b.type})\n${b.name} · ${b.phone} · ${b.email}\nReason: ${b.reason}`
    );

    return NextResponse.json({ ok: true, id: appointment.id }, { status: 201 });
  } catch (err) {
    console.error("[ozmo] booking save failed", err);
    return NextResponse.json({ error: "We couldn't confirm that booking. Please try again." }, { status: 500 });
  }
}
