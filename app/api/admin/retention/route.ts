import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { prisma } from "@/lib/db";
import { runRetention } from "@/lib/retention";
import { audit } from "@/lib/services/audit";

export const runtime = "nodejs";

/** Runs the retention rules now. The same job runs from `npm run retention:run` on a schedule. */
export const POST = apiHandler(async function POST() {
  const session = await authorize("retention.run");
  const report = await runRetention(session.clinicId);
  await audit(prisma, session, "RETENTION_RUN", { type: "Clinic", id: session.clinicId }, { removed: Object.fromEntries(report.map((r) => [r.label, r.count])) });
  return NextResponse.json({ ok: true, report });
});
