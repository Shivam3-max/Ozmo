import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { uploadFromPortal } from "@/lib/services/documents";

export const runtime = "nodejs";

/** A client shares lab results or another document with the clinic. */
export const POST = apiHandler(async function POST(req: Request) {
  const session = await authorize("portal.self");
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Choose a file to upload." }, { status: 422 });
  const file = form.get("file");
  const result = await uploadFromPortal(session, {
    title: String(form.get("title") ?? ""),
    type: String(form.get("type") ?? "LAB_REPORT"),
    file: file instanceof File ? file : null,
  });
  return NextResponse.json({ ok: true, ...result }, { status: 201 });
});
