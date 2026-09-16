import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { convertLead } from "@/lib/services/clients";

export const runtime = "nodejs";

const schema = z.object({
  programSlug: z.string().trim().min(1),
  durationMonths: z.coerce.number().int().min(1).max(24),
});

export const POST = apiHandler(async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("clients.convertLead");
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a programme and duration." }, { status: 422 });

  const { id } = await ctx.params;
  const client = await convertLead(session, id, parsed.data);
  return NextResponse.json({ ok: true, clientId: client.id }, { status: 201 });
});
