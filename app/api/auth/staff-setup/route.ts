import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { limitByIp } from "@/lib/rate-limit";
import { PASSWORD_MAX } from "@/lib/password-policy";
import { apiHandler } from "@/lib/api";
import type { StaffRole } from "@/lib/policy";
import { setPasswordFromLink } from "@/lib/services/portal-access";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(10).max(80),
  password: z.string().max(PASSWORD_MAX),
});

/** Staff finish a setup or reset link by choosing their own password. */
export const POST = apiHandler(async function POST(req: Request) {
  const limit = await limitByIp(req.headers, "staff-setup", 10, 15 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the form." }, { status: 422 });

  const user = await setPasswordFromLink("staff", parsed.data.token, parsed.data.password);
  await createSession({
    sub: user.id, name: user.name, email: user.email,
    role: user.role as StaffRole, clinicId: user.clinicId, sessionVersion: user.sessionVersion,
  });
  return NextResponse.json({ ok: true });
});
