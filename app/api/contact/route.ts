import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contactSchema, fieldErrors } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { CLINIC_ID, notifyClinic } from "@/lib/leads";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limit = rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
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
    await notifyClinic(`New enquiry — ${c.topic}`, `${c.name} · ${c.phone}\n\n${c.message}`);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[ozmo] contact save failed", err);
    return NextResponse.json({ error: "We couldn't send that. Please try again." }, { status: 500 });
  }
}
