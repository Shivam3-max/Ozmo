import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { openDocument } from "@/lib/services/documents";

export const runtime = "nodejs";

/**
 * Streams a decrypted document. Portal links add `?as=client`; without it the
 * staff session is used. Never cached, never framed, and never run as a page.
 */
export const GET = apiHandler(async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const scope = new URL(req.url).searchParams.get("as") === "client" ? "client" : "staff";
  const viewer = await getSession(scope);
  if (!viewer) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await ctx.params;
  const doc = await openDocument(viewer, id);
  const download = new URL(req.url).searchParams.get("download") === "1";
  return new NextResponse(new Uint8Array(doc.bytes), {
    headers: {
      "Content-Type": doc.mime,
      "Content-Length": String(doc.bytes.length),
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${doc.filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; frame-ancestors 'none'",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
});
