import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { createReport, newReportSchema } from "@/lib/services/reports";

export const runtime = "nodejs";

/** Drafts a progress report from the period's records (default: the last 30 days). */
export const POST = apiHandler(async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("reports.write");
  const parsed = newReportSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the dates." }, { status: 422 });
  const { id } = await ctx.params;
  const report = await createReport(session, id, parsed.data);
  return NextResponse.json({ ok: true, id: report.id }, { status: 201 });
});
