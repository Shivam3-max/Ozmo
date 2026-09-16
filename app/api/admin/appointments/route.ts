import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { MAX_APPOINTMENT_MINUTES, meetingUrlSchema, scheduleAppointment } from "@/lib/services/appointments";

export const runtime = "nodejs";

const schema = z
  .object({
    clientId: z.string().min(1).max(40).optional(),
    leadId: z.string().min(1).max(40).optional(),
    type: z.enum(["INITIAL", "FOLLOW_UP"]),
    mode: z.enum(["IN_CLINIC", "VIDEO"]),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Choose a time"),
    durationMin: z.coerce.number().int().min(15).max(MAX_APPOINTMENT_MINUTES),
    meetingUrl: z.union([meetingUrlSchema, z.literal("")]).optional(),
    reason: z.string().trim().max(500).optional(),
  })
  .refine((v) => Boolean(v.clientId) !== Boolean(v.leadId), "Choose who the appointment is for.");

/** Staff schedule an appointment — typically a client's follow-up — on the clinic diary. */
export const POST = apiHandler(async function POST(req: Request) {
  const session = await authorize("appointments.manage");
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 422 });
  }
  const result = await scheduleAppointment(session, parsed.data);
  return NextResponse.json({ ok: true, ...result }, { status: 201 });
});
