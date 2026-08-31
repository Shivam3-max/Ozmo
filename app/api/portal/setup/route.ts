import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(10).max(80),
  password: z.string().min(8, "Use at least 8 characters").max(200),
});

export async function POST(req: Request) {
  const limit = rateLimit(`setup:${clientIp(req.headers)}`, 10, 15 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 422 });
  }

  const user = await prisma.user.findUnique({
    where: { inviteToken: parsed.data.token },
    include: { client: true },
  });

  if (!user || !user.inviteExpiresAt || user.inviteExpiresAt < new Date() || user.role !== "CLIENT") {
    return NextResponse.json({ error: "That link has expired. Ask the clinic for a new one." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      inviteToken: null,
      inviteExpiresAt: null,
      lastLoginAt: new Date(),
    },
  });

  await createSession({
    sub: user.id, name: user.name, email: user.email,
    role: "CLIENT", clinicId: user.clinicId,
  });

  return NextResponse.json({ ok: true });
}
