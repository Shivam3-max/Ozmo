/**
 * Rejects state-changing requests that a browser sent on behalf of another site.
 *
 * The session cookie is SameSite=Lax, which already stops most cross-site
 * POSTs, but not requests from sibling subdomains or older browsers. Every
 * modern browser labels requests with Sec-Fetch-Site and/or Origin, so a
 * request carrying either must come from this origin. Requests with neither
 * can't come from a browser page, and can't ride a user's cookie.
 */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function crossSiteRejection(
  method: string,
  headers: Headers,
  siteUrl: string | undefined = process.env.NEXT_PUBLIC_SITE_URL
): string | null {
  if (SAFE_METHODS.has(method.toUpperCase())) return null;

  const fetchSite = headers.get("sec-fetch-site");
  if (fetchSite) {
    // "none" is a user-initiated request (e.g. a bookmark), never a page script.
    return fetchSite === "same-origin" || fetchSite === "none" ? null : `sec-fetch-site=${fetchSite}`;
  }

  const origin = headers.get("origin");
  if (!origin) return null;
  if (origin === "null") return "opaque origin";

  let originHost: string;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return "malformed origin";
  }

  const allowed = new Set(
    [
      headers.get("x-forwarded-host")?.split(",")[0]?.trim(),
      headers.get("host"),
      siteUrl ? safeHost(siteUrl) : undefined,
    ]
      .filter((h): h is string => Boolean(h))
      .map((h) => h.toLowerCase())
  );
  return allowed.has(originHost) ? null : `origin ${originHost}`;
}

function safeHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}
