import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { retryNotification } from "@/lib/notifications/outbox";

export const runtime = "nodejs";

/** Re-sends a failed or skipped email. The outcome is stored on the notification. */
export const POST = apiHandler(async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("notifications.manage");
  const { id } = await ctx.params;
  const status = await retryNotification(session.clinicId, id);
  return NextResponse.json({ ok: true, status });
});
