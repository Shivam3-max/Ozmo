import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorize } from "@/lib/auth";
import { afterDeletionRequest } from "@/lib/notifications/public-forms";
import { apiHandler } from "@/lib/api";

export const runtime = "nodejs";

/**
 * Right of erasure. Recorded, acknowledged and passed to the clinic rather than
 * executed instantly — some clinical records carry a retention obligation, and
 * the privacy policy states what is kept and for how long.
 */
export const POST = apiHandler(async function POST() {
  const session = await authorize("portal.self");

  const client = await prisma.client.findFirst({
    where: { userId: session.sub, deletedAt: null },
    include: { user: true },
  });
  if (!client) return NextResponse.json({ error: "No client record." }, { status: 404 });

  const open = await prisma.dataRequest.findFirst({
    where: { clientId: client.id, type: "DELETE", status: { in: ["OPEN", "IN_PROGRESS"] } },
  });
  if (open) return NextResponse.json({ ok: true, requestId: open.id, alreadyOpen: true });

  const request = await prisma.dataRequest.create({ data: { clientId: client.id, type: "DELETE" } });

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

  await afterDeletionRequest(client.clinicId, request.id);

  return NextResponse.json({ ok: true, requestId: request.id });
});
