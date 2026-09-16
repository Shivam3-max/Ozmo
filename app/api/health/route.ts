import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler } from "@/lib/api";
import { databaseFailureReason, reportError } from "@/lib/observability";
import { describeDatabase } from "@/lib/database-url.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unavailable = () =>
  NextResponse.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });

/**
 * Is the application actually able to work? Reaching the server is not enough:
 * a database with no tables answers `SELECT 1` happily and then fails every real
 * query, which is exactly what a deployment that skipped its migrations looks
 * like. So the schema is checked too.
 *
 * The caller only ever learns "ok" or "unavailable"; the reason goes to the
 * application log and the error webhook.
 */
export const GET = apiHandler(async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    const reason = databaseFailureReason(err);
    await reportError(err, { source: "api", method: "GET", path: "/api/health", route: `${describeDatabase()}${reason ? ` — ${reason}` : ""}` });
    return unavailable();
  }

  try {
    const [{ applied }] = await prisma.$queryRaw<{ applied: bigint }[]>`
      SELECT COUNT(*) AS applied FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL`;
    if (Number(applied) === 0) throw new Error("no migrations have been applied");
  } catch (err) {
    await reportError(err, {
      source: "api",
      method: "GET",
      path: "/api/health",
      route: `${describeDatabase()} — the database has no tables: migrations have not been applied to it (the build does this; check it ran against this database)`,
    });
    return unavailable();
  }

  return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
});
