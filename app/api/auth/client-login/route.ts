import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  identifier: z.string().trim().min(3, "Enter your phone or email").max(200),
  password: z.string().min(1, "Enter your password").max(200),
});

export async function POST(req: Request) {
  const limit = rateLimit(`clientlogin:${clientIp(req.headers)}`, 8, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter your details." }, { status: 422 });

  const id = parsed.data.identifier.toLowerCase();
  const user = await prisma.user.findFirst({
    where: { role: "CLIENT", OR: [{ email: id }, { phone: parsed.data.identifier.trim() }] },
  });

  // Same message and comparable timing either way, so this can't be used to
  // find out who is a client of the clinic.
  const hash = user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidiu";
  const ok = await bcrypt.compare(parsed.data.password, hash);

  if (!user || !ok || !user.isActive) {
    return NextResponse.json({ error: "Those details don't match." }, { status: 401 });
  }

  await createSession({
    sub: user.id, name: user.name, email: user.email,
    role: "CLIENT", clinicId: user.clinicId,
  });
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return NextResponse.json({ ok: true });
}
