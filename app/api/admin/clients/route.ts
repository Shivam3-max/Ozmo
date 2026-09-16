import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/auth";
import { phoneSchema } from "@/lib/validation";
import { apiHandler } from "@/lib/api";
import { createClient } from "@/lib/services/clients";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: phoneSchema,
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
export const POST = apiHandler(async function POST(req: Request) {
  const session = await authorize("clients.create");
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 422 });
  }
  const client = await createClient(session, parsed.data);
  return NextResponse.json({ ok: true, clientId: client.id }, { status: 201 });
});
