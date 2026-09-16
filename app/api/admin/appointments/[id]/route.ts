import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { changeAppointmentStatus, meetingUrlSchema, setMeetingLink } from "@/lib/services/appointments";

export const runtime = "nodejs";

const statusSchema = z.object({ status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]) });
const linkSchema = z.object({ meetingUrl: z.union([meetingUrlSchema, z.literal("")]) });

export const PATCH = apiHandler(async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("appointments.manage");
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);

  // Adding or changing the video-call link the client sees in their portal.
  if (body && typeof body === "object" && "meetingUrl" in body) {
    const link = linkSchema.safeParse(body);
    if (!link.success) return NextResponse.json({ error: link.error.issues[0]?.message ?? "Invalid link." }, { status: 422 });
    const result = await setMeetingLink(session, id, link.data.meetingUrl);
    return NextResponse.json({ ok: true, ...result });
  }

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Unknown status." }, { status: 422 });
  await changeAppointmentStatus(session, id, parsed.data.status);
  return NextResponse.json({ ok: true });
});
