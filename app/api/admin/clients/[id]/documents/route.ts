import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { uploadForClient } from "@/lib/services/documents";

export const runtime = "nodejs";

/** Staff add a PDF or image to a client's file (multipart form). */
export const POST = apiHandler(async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("documents.upload");
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Choose a file to upload." }, { status: 422 });

  const { id } = await ctx.params;
  const file = form.get("file");
  const result = await uploadForClient(session, id, {
    title: String(form.get("title") ?? ""),
    type: String(form.get("type") ?? ""),
    visibleToClient: form.get("visibleToClient") !== "false",
    file: file instanceof File ? file : null,
  });
  return NextResponse.json({ ok: true, ...result }, { status: 201 });
});
