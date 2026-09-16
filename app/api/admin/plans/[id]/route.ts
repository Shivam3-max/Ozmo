import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { describePlanIssue, planSaveSchema } from "@/lib/services/plan-diff";
import { savePlan } from "@/lib/services/plans";

export const runtime = "nodejs";

export const PATCH = apiHandler(async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("plans.edit");
  const { id } = await ctx.params;

  const body = await req.json().catch(() => null);
  const parsed = planSaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: `Couldn't save: ${describePlanIssue(parsed.error.issues[0], body)}`, issues: parsed.error.issues.slice(0, 5) },
      { status: 422 }
    );
  }

  const result = await savePlan(session, id, parsed.data);
  return NextResponse.json({ ok: true, published: result.published, updatedAt: result.updatedAt.toISOString(), written: result.written });
});
