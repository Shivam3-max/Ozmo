import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { duplicatePlan } from "@/lib/services/plans";

export const runtime = "nodejs";

/**
 * Start the next version of a plan. She revises fortnightly, and the previous
 * version stays archived — plan history is part of the clinical record.
 */
export const POST = apiHandler(async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("plans.edit");
  const { id } = await ctx.params;
  const result = await duplicatePlan(session, id);
  return NextResponse.json({ ok: true, ...result }, { status: result.reused ? 200 : 201 });
});
