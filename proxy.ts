import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { crossSiteRejection } from "@/lib/csrf";

// Must match SESSION_COOKIES in lib/auth.ts (the proxy can't import server-only modules).
const SESSION_COOKIES = { staff: "ozmo_staff", client: "ozmo_client" } as const;
const STAFF_ROLES = new Set(["SUPER_ADMIN", "DIETITIAN", "ASSISTANT", "FRONT_DESK"]);

/**
 * Largest request body an API accepts. Uploads allow a 5 MB file plus form
 * overhead; everything else is JSON. Bodies without a declared length are also
 * capped by experimental.proxyClientMaxBodySize in next.config.ts.
 */
const UPLOAD_ROUTE = /^\/api\/(?:admin\/clients\/[^/]+\/documents|portal\/documents)$/;
const bodyLimit = (pathname: string) => (UPLOAD_ROUTE.test(pathname) ? 6 * 1024 * 1024 : 2 * 1024 * 1024);

/** Edge-level routing guard; server pages and APIs revalidate the DB user too. */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API: the only proxy job is refusing writes forged from another site.
  if (pathname.startsWith("/api/")) {
    const rejection = crossSiteRejection(req.method, req.headers);
    if (rejection) {
      return NextResponse.json({ error: "This request didn't come from the Ozmo site." }, { status: 403 });
    }
    const declared = Number(req.headers.get("content-length") ?? 0);
    if (declared > bodyLimit(pathname)) {
      return NextResponse.json({ error: "That request is too large." }, { status: 413 });
    }
    return NextResponse.next();
  }

  if (pathname === "/admin/login" || pathname.startsWith("/admin/setup/") || pathname.startsWith("/portal/setup")) {
    return NextResponse.next();
  }

  const isPortal = pathname.startsWith("/portal");
  const token = req.cookies.get(isPortal ? SESSION_COOKIES.client : SESSION_COOKIES.staff)?.value;
  const secret = process.env.AUTH_SECRET;

  if (token && secret) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      const role = String(payload.role);
      const allowed = isPortal ? role === "CLIENT" : STAFF_ROLES.has(role);
      if (allowed) {
        const res = NextResponse.next();
        res.headers.set("X-Robots-Tag", "noindex, nofollow");
        res.headers.set("Cache-Control", "private, no-store");
        return res;
      }
      if (isPortal && STAFF_ROLES.has(role)) return NextResponse.redirect(new URL("/admin", req.url));
      if (!isPortal && role === "CLIENT") return NextResponse.redirect(new URL("/portal", req.url));
    } catch {
      // Invalid and expired tokens continue to the login redirect.
    }
  }

  const url = req.nextUrl.clone();
  url.pathname = isPortal ? "/login" : "/admin/login";
  const root = isPortal ? "/portal" : "/admin";
  // Keep the query string so a deep link like /admin/clients?view=archived survives signing in.
  const destination = pathname + req.nextUrl.search;
  url.search = destination === root ? "" : `?next=${encodeURIComponent(destination)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*", "/portal/:path*", "/api/:path*"] };
