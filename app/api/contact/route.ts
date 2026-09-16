import { NextResponse } from "next/server";
import { CLINIC_ID } from "@/lib/clinic";
import { prisma } from "@/lib/db";
import { reportError } from "@/lib/observability";
import { contactSchema, fieldErrors } from "@/lib/validation";
import { limitByIp } from "@/lib/rate-limit";
import { afterEnquiry } from "@/lib/notifications/public-forms";
import { apiHandler } from "@/lib/api";

export const runtime = "nodejs";

export const POST = apiHandler(async function POST(req: Request) {
  const limit = await limitByIp(req.headers, "contact", 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many messages. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form.", fields: fieldErrors(parsed.error) }, { status: 422 });
  }

  const c = parsed.data;
  try {
    await prisma.contactMessage.create({
      data: {
        clinicId: CLINIC_ID,
        name: c.name,
        phone: c.phone,
        email: c.email || null,
        topic: c.topic,
        message: c.message,
      },
    });
    await afterEnquiry(c.topic);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    await reportError(err, { source: "api", method: "POST", path: "/api/contact" });
    return NextResponse.json({ error: "We couldn't send that. Please try again." }, { status: 500 });
  }
});
