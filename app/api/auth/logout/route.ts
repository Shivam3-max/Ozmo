import { NextResponse } from "next/server";
import { destroySession, getSession, revokeSession, signOutEverywhere, type SessionScope } from "@/lib/auth";
import { clientIp } from "@/lib/rate-limit";
import { auditAuth } from "@/lib/security-audit";
import { apiHandler } from "@/lib/api";

export const runtime = "nodejs";

/**
 * Signs out of the practice area (?scope=staff), the portal (?scope=client), or
 * both when no scope is given.
 *
 * By default only this device is signed out: its session id is revoked, so a
 * copied token stops working too. `?everywhere=1` ends every session for that
 * person — for a lost phone or a shared computer they can't get back to.
 */
export const POST = apiHandler(async function POST(req: Request) {
  const params = new URL(req.url).searchParams;
  const requested = params.get("scope");
  const everywhere = params.get("everywhere") === "1";
  const scopes: SessionScope[] = requested === "staff" || requested === "client" ? [requested] : ["staff", "client"];

  for (const scope of scopes) {
    const session = await getSession(scope);
    if (!session) continue;
    if (everywhere) await signOutEverywhere(session.sub);
    else await revokeSession(session);
    await auditAuth({
      action: everywhere ? "LOGOUT_EVERYWHERE" : "LOGOUT",
      scope,
      identifier: session.email,
      user: { id: session.sub, clinicId: session.clinicId },
      ip: clientIp(req.headers),
    });
  }
  for (const scope of scopes) await destroySession(scope);
  return NextResponse.json({ ok: true });
});
