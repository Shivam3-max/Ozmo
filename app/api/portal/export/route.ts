import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";

export const runtime = "nodejs";

/** Right of access, self-serve. Everything we hold about them, in one file. */
export const GET = apiHandler(async function GET() {
  const session = await authorize("portal.self");

  const client = await prisma.client.findFirst({
    where: { userId: session.sub, deletedAt: null },
    include: {
      user: { select: { name: true, email: true, phone: true, createdAt: true } },
      assessment: true,
      healthProfiles: { orderBy: { version: "desc" } },
      enrollments: { include: { program: { select: { name: true } } } },
      measurements: { orderBy: { date: "asc" } },
      foodLogs: { orderBy: { date: "asc" } },
      waterLogs: { orderBy: { date: "asc" } },
      appointments: { include: { note: true } },
      documents: { select: { title: true, type: true, mimeType: true, sizeBytes: true, createdAt: true, visibleToClient: true } },
      progressReports: {
        where: { status: "SENT" },
        select: { periodStart: true, periodEnd: true, data: true, observations: true, nextMonthFocus: true, sentAt: true },
      },
      // Drafts are unfinished and unreviewed; only plans that were given to the client belong in their copy.
      dietPlans: {
        where: { status: { in: ["ACTIVE", "ARCHIVED"] } },
        include: {
          days: { include: { slots: { include: { items: true } } } },
          sections: true,
        },
      },
      thread: { include: { messages: { orderBy: { createdAt: "asc" } } } },
    },
  });
  if (!client) return NextResponse.json({ error: "No client record." }, { status: 404 });

  await prisma.auditLog.create({
    data: { clinicId: client.clinicId, actorId: session.sub, action: "CLIENT_DATA_EXPORTED", entityType: "Client", entityId: client.id },
  });

  // Private clinical notes are not part of a client-facing export unless the
  // dietitian chose to share them.
  const appointments = client.appointments.map((a) => ({
    scheduledAt: a.scheduledAt,
    type: a.type,
    mode: a.mode,
    status: a.status,
    reason: a.reason,
    note: a.note?.sharedWithClient
      ? { observations: a.note.observations, planOfAction: a.note.planOfAction }
      : null,
  }));

  const payload = {
    exportedAt: new Date().toISOString(),
    clinic: "Ozmo Diet Clinic",
    about: {
      ...client.user,
      clientCode: client.clientCode,
      city: client.city,
      heightCm: client.heightCm,
      startWeightKg: client.startWeightKg,
      targetWeightKg: client.targetWeightKg,
      foodPreference: client.foodPreference,
      allergies: client.allergies,
    },
    assessment: client.assessment,
    healthRecord: client.healthProfiles,
    programmes: client.enrollments,
    plans: client.dietPlans,
    measurements: client.measurements,
    foodLogs: client.foodLogs,
    waterLogs: client.waterLogs,
    appointments,
    // File contents are downloadable from My reports; the export lists what is held.
    documents: client.documents,
    progressReports: client.progressReports,
    messages: client.thread?.messages ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ozmo-${client.clientCode}-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
});
