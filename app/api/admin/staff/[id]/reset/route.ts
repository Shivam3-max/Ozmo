import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { issueStaffLink } from "@/lib/services/portal-access";

export const runtime = "nodejs";

/**
 * A new one-time link for a staff member who is locked out or never finished
 * setting up. Their current password keeps working until the link is used.
 */
export const POST = apiHandler(async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("staff.manage");
  const { id } = await ctx.params;
  const result = await issueStaffLink(session, id);
  return NextResponse.json({ ok: true, ...result });
});
