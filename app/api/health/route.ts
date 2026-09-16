import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler } from "@/lib/api";
import { databaseFailureReason, reportError } from "@/lib/observability";
import { describeDatabase } from "@/lib/database-url.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = apiHandler(async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    // The caller gets nothing but "unavailable"; whoever has to fix it needs the
    // reason, so it goes to the application log and the error webhook. The entry
    // carries the Prisma code and the host and database name — never the password.
    const reason = databaseFailureReason(err);
    await reportError(err, { source: "api", method: "GET", path: "/api/health", route: `${describeDatabase()}${reason ? ` — ${reason}` : ""}` });
    return NextResponse.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
});
