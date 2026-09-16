import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { issueClientLink } from "@/lib/services/portal-access";

export const runtime = "nodejs";

const schema = z.object({
  // Required, and deliberate, when the client already has a password.
  reset: z.boolean().default(false),
});

export const POST = apiHandler(async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("portal.invite");
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 422 });

  const { id } = await ctx.params;
  const result = await issueClientLink(session, id, { reset: parsed.data.reset });
  return NextResponse.json({ ok: true, ...result });
});
