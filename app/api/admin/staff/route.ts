import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { STAFF_ROLE_VALUES } from "@/lib/staff";
import { createStaff } from "@/lib/services/portal-access";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(1, "Enter their name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid work email").max(200),
  role: z.enum(STAFF_ROLE_VALUES),
});

/** Adds a staff member. They get a one-time link to choose their own password. */
export const POST = apiHandler(async function POST(req: Request) {
  const session = await authorize("staff.manage");
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 422 });
  }
  const result = await createStaff(session, parsed.data);
  return NextResponse.json({ ok: true, ...result }, { status: 201 });
});
