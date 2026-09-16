import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { approveReport, discardReport, reportTextSchema, sendReport, updateReport } from "@/lib/services/reports";

export const runtime = "nodejs";

const schema = z.discriminatedUnion("action", [
  reportTextSchema.extend({ action: z.literal("save"), refresh: z.boolean().optional() }),
  z.object({ action: z.literal("approve") }),
  z.object({ action: z.literal("send") }),
]);

export const PATCH = apiHandler(async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("reports.write");
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 422 });
  const { id } = await ctx.params;
  const body = parsed.data;

  if (body.action === "approve") {
    await approveReport(session, id);
    return NextResponse.json({ ok: true });
  }
  if (body.action === "send") {
    return NextResponse.json({ ok: true, ...(await sendReport(session, id)) });
  }
  await updateReport(session, id, body);
  return NextResponse.json({ ok: true });
});

export const DELETE = apiHandler(async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("reports.write");
  const { id } = await ctx.params;
  await discardReport(session, id);
  return NextResponse.json({ ok: true });
});
