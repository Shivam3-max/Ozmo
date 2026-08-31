import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "ozmo_session";
const STAFF_ROLES = new Set(["SUPER_ADMIN", "DIETITIAN", "ASSISTANT", "FRONT_DESK"]);

/**
 * First of three layers. Pages call requireStaff() as well, and queries are
 * scoped at the repository level — one of these will eventually be forgotten,
 * so none of them stands alone.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  // Password setup runs off a one-time invite token, so it can't require a session.
  if (pathname.startsWith("/portal/setup")) return NextResponse.next();

  const isPortal = pathname.startsWith("/portal");

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;

  if (token && secret) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      const role = String(payload.role);
      const allowed = isPortal ? role === "CLIENT" : STAFF_ROLES.has(role);
      if (allowed) {
        const res = NextResponse.next();
        res.headers.set("X-Robots-Tag", "noindex, nofollow");
        return res;
      }
      // Signed in, but on the wrong surface — send them to their own.
      if (isPortal && STAFF_ROLES.has(role)) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      if (!isPortal && role === "CLIENT") {
        return NextResponse.redirect(new URL("/portal", req.url));
      }
    } catch {
      // fall through to the redirect
    }
  }

  const url = req.nextUrl.clone();
  url.pathname = isPortal ? "/login" : "/admin/login";
  const root = isPortal ? "/portal" : "/admin";
  url.search = pathname === root ? "" : `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*", "/portal/:path*"] };
