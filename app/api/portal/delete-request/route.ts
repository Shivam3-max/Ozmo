import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notifyClinic } from "@/lib/leads";

export const runtime = "nodejs";

/**
 * Right of erasure. Recorded, acknowledged and passed to the clinic rather than
 * executed instantly — some clinical records carry a retention obligation, and
 * the privacy policy states what is kept and for how long.
 */
export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const client = await prisma.client.findFirst({
    where: { userId: session.sub, deletedAt: null },
    include: { user: true },
  });
  if (!client) return NextResponse.json({ error: "No client record." }, { status: 404 });

  await prisma.auditLog.create({
    data: {
      clinicId: client.clinicId,
      actorId: session.sub,
      action: "DELETION_REQUESTED",
      entityType: "Client",
      entityId: client.id,
      changes: { requestedAt: new Date().toISOString() },
    },
  });

  await notifyClinic(
    `Data deletion requested — ${client.user.name}`,
    `${client.user.name} (${client.clientCode}) has asked for their data to be deleted. Respond within the window stated in the privacy policy.`
  );

  return NextResponse.json({ ok: true });
}
