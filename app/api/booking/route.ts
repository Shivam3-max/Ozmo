import { NextResponse } from "next/server";
import { CLINIC_ID } from "@/lib/clinic";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { reportError } from "@/lib/observability";
import { bookingSchema, fieldErrors } from "@/lib/validation";
import { limitByIp } from "@/lib/rate-limit";
import { POLICY_VERSION, scoreLead, slotKeyFor, earlierLeadWithPhone, flagPossibleDuplicate } from "@/lib/leads";
import { BOOKABLE_TIMES, findClash, unavailableTimes } from "@/lib/services/appointments";
import { clinicWallTime, clinicWeekday, formatClinic } from "@/lib/clinic-time";
import { afterBooking } from "@/lib/notifications/public-forms";
import { apiHandler } from "@/lib/api";

export const runtime = "nodejs";

const BOOKING_MINUTES = 60;
const BOOKING_WINDOW_DAYS = 60;

class SlotTaken extends Error {}

/** A validated clinic-clock date and time from the offered grid, never a browser-provided label. */
function parseSlot(date: string, time: string): Date | null {
  if (!BOOKABLE_TIMES.includes(time)) return null;
  const start = clinicWallTime(date, time);
  if (!start) return null;
  const now = Date.now();
  if (clinicWeekday(start) === 6 || start.getTime() <= now || start.getTime() > now + BOOKING_WINDOW_DAYS * 864e5) return null;
  return start;
}

export const GET = apiHandler(async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date") ?? "";
  const dayStart = clinicWallTime(date, "00:00");
  const lastSlot = clinicWallTime(date, BOOKABLE_TIMES[BOOKABLE_TIMES.length - 1]);
  if (!dayStart || !lastSlot || clinicWeekday(dayStart) === 6 || lastSlot.getTime() <= Date.now() ||
      dayStart.getTime() > Date.now() + BOOKING_WINDOW_DAYS * 864e5) {
    return NextResponse.json({ error: "Invalid date." }, { status: 422 });
  }

  const taken = await unavailableTimes(prisma, dayStart, (time) => clinicWallTime(date, time)!, BOOKING_MINUTES);
  const past = BOOKABLE_TIMES.filter((time) => clinicWallTime(date, time)!.getTime() <= Date.now());
  return NextResponse.json({ booked: [...new Set([...taken, ...past])] });
});

export const POST = apiHandler(async function POST(req: Request) {
  const limit = await limitByIp(req.headers, "booking", 6, 60 * 60 * 1000);
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
    // One transaction: if the slot is taken, no lead or activity is left behind.
    // Serializable so two overlapping bookings can't both pass the clash check.
    // A phone already on file is flagged, never edited — see lib/leads.ts.
    const appointment = await prisma.$transaction(async (tx) => {
      if (await findClash(tx, scheduledAt, BOOKING_MINUTES)) throw new SlotTaken();

      const earlier = await earlierLeadWithPhone(tx, b.phone);
      const lead = await tx.lead.create({
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
          duplicateOfLeadId: earlier?.id ?? null,
        },
      });

      const created = await tx.appointment.create({
        data: {
          leadId: lead.id,
          type: "INITIAL",
          mode: b.type === "video" ? "VIDEO" : "IN_CLINIC",
          status: "SCHEDULED",
          scheduledAt,
          slotKey: slotKeyFor(scheduledAt),
          durationMin: BOOKING_MINUTES,
          reason: b.reason,
          notes: b.notes || null,
        },
      });

      await tx.leadActivity.create({
        data: { leadId: lead.id, type: "BOOKING_CREATED", note: `${b.date} ${b.time} · ${b.type}` },
      });
      if (earlier) await flagPossibleDuplicate(tx, earlier.id, lead, "booking");
      return created;
    }, { isolationLevel: "Serializable" });

    await afterBooking({
      name: b.name, email: b.email, mode: b.type, appointmentId: appointment.id,
      when: formatClinic(scheduledAt, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }),
    });

    return NextResponse.json({ ok: true, id: appointment.id }, { status: 201 });
  } catch (err) {
    const conflict =
      err instanceof SlotTaken ||
      (err instanceof Prisma.PrismaClientKnownRequestError && (err.code === "P2002" || err.code === "P2034"));
    if (conflict) {
      return NextResponse.json({ error: "That slot was just booked. Please choose another.", slotTaken: true }, { status: 409 });
    }
    await reportError(err, { source: "api", method: "POST", path: "/api/booking" });
    return NextResponse.json({ error: "We couldn't confirm that booking. Please try again." }, { status: 500 });
  }
});
