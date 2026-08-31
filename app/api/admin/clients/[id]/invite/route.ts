import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { getSession, isStaff } from "@/lib/auth";
import { CLINIC_ID } from "@/lib/leads";

export const runtime = "nodejs";

const INVITE_DAYS = 14;

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const client = await prisma.client.findFirst({
    where: { id, clinicId: CLINIC_ID },
    include: { user: true },
  });
  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  const token = randomBytes(24).toString("base64url");
  await prisma.user.update({
    where: { id: client.userId },
    data: {
      inviteToken: token,
      inviteExpiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.auditLog.create({
    data: {
      clinicId: CLINIC_ID, actorId: session.sub, action: "PORTAL_INVITE_ISSUED",
      entityType: "Client", entityId: id,
    },
  });

  // Returned rather than sent — no mail or WhatsApp provider is wired yet, so
  // staff copy the link and send it themselves.
  return NextResponse.json({
    ok: true,
    path: `/portal/setup/${token}`,
    expiresInDays: INVITE_DAYS,
    hasPassword: Boolean(client.user.passwordHash),
  });
}
