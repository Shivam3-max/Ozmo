import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { removeDocument, setDocumentVisibility } from "@/lib/services/documents";

export const runtime = "nodejs";

const schema = z.object({ visibleToClient: z.boolean() });

export const PATCH = apiHandler(async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("documents.upload");
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 422 });
  const { id } = await ctx.params;
  await setDocumentVisibility(session, id, parsed.data.visibleToClient);
  return NextResponse.json({ ok: true });
});

export const DELETE = apiHandler(async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("documents.upload");
  const { id } = await ctx.params;
  await removeDocument(session, id);
  return NextResponse.json({ ok: true });
});
