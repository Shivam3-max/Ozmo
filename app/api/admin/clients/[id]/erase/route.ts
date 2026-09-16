import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { eraseClient } from "@/lib/services/erasure";

export const runtime = "nodejs";

const schema = z.object({
  confirmCode: z.string().trim().min(1, "Type the client code to confirm.").max(40),
  requestId: z.string().min(1).max(40).optional(),
});

/** Permanently erases a client's personal and health data. Administrator only; cannot be undone. */
export const POST = apiHandler(async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("privacy.manage");
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 422 });
  const { id } = await ctx.params;
  await eraseClient(session, id, parsed.data);
  return NextResponse.json({ ok: true });
});
