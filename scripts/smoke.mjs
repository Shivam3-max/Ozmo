// Post-deploy smoke test for the live site. Read-only by default: it only
// fetches public pages and sends requests that are refused before touching data.
//
//   npm run smoke -- https://ozmodietclinic.com
//   npm run smoke -- https://ozmodietclinic.com --check-proxy
//   npm run smoke -- http://localhost:3000 --canonical https://ozmodietclinic.com
//
// --check-proxy additionally proves the rate limiter sees real visitor addresses
// behind Hostinger's proxy: it makes 21 failed sign-ins for a made-up account
// while forging a different X-Forwarded-For each time, and expects to be
// throttled. That writes sign-in audit rows and locks nobody real out.
const args = process.argv.slice(2);
const base = (args.find((a, i) => /^https?:\/\//.test(a) && args[i - 1] !== "--canonical") ?? process.env.SMOKE_URL ?? "").replace(/\/$/, "");
const checkProxy = args.includes("--check-proxy");
// The canonical site URL, when it differs from the address being tested (e.g. a staging host).
const canonicalFlag = args.indexOf("--canonical");
const canonical = (canonicalFlag >= 0 ? args[canonicalFlag + 1] : base).replace(/\/$/, "");
if (!base) {
  console.error("Usage: npm run smoke -- https://your-domain [--check-proxy]");
  process.exit(2);
}

let failed = 0;
const check = (label, ok, detail = "") => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok || !detail ? "" : `  — ${detail}`}`);
};
const get = (path, init = {}) => fetch(base + path, { redirect: "manual", ...init, headers: { "User-Agent": "ozmo-smoke-test", ...(init.headers ?? {}) } });

const isHttps = base.startsWith("https://");
check("site URL uses HTTPS", isHttps, base);

let r = await get("/api/health");
const health = await r.json().catch(() => ({}));
check("health check passes (app and database up)", r.status === 200 && health.status === "ok", `${r.status} ${JSON.stringify(health)}`);
check("health check is not cached", /no-store/.test(r.headers.get("cache-control") ?? ""));

if (isHttps) {
  const plain = await fetch(base.replace("https://", "http://") + "/", { redirect: "manual" }).catch(() => null);
  check("plain HTTP redirects to HTTPS", !plain || (plain.status >= 300 && plain.status < 400 && /^https:/.test(plain.headers.get("location") ?? "")), plain ? `${plain.status} ${plain.headers.get("location")}` : "");
}

r = await get("/");
const home = await r.text();
const h = (name) => r.headers.get(name) ?? "";
check("home page loads", r.status === 200, r.status);
check("Strict-Transport-Security is set", /max-age=\d{6,}/.test(h("strict-transport-security")), h("strict-transport-security"));
check("Content-Security-Policy is set", /default-src 'self'/.test(h("content-security-policy")) && /frame-ancestors 'none'/.test(h("content-security-policy")));
check("X-Frame-Options, X-Content-Type-Options and Referrer-Policy are set", h("x-frame-options") === "DENY" && h("x-content-type-options") === "nosniff" && Boolean(h("referrer-policy")));
check("no X-Powered-By header", !r.headers.get("x-powered-by"));
check("canonical URL points at this domain", home.includes(`<link rel="canonical" href="${canonical}`), home.match(/<link rel="canonical" href="([^"]+)"/)?.[1]);
check("no development-only legal review banner", !/Internal legal review note/.test(home));

r = await get("/robots.txt");
const robots = await r.text();
check("robots.txt blocks admin, portal and API", r.status === 200 && /Disallow: \/admin/.test(robots) && /Disallow: \/portal/.test(robots) && /Disallow: \/api/.test(robots));
check("robots.txt points at this domain's sitemap", robots.includes(`${canonical}/sitemap.xml`), robots.match(/Sitemap: (.*)/)?.[1]);
r = await get("/sitemap.xml");
const sitemap = await r.text();
check("sitemap lists public pages on this domain only", r.status === 200 && sitemap.includes(`${canonical}/programs`) && !/\/admin|\/portal/.test(sitemap));

for (const p of ["/programs", "/assessment", "/book", "/contact", "/privacy-policy", "/login", "/admin/login"]) {
  r = await get(p);
  check(`${p} loads`, r.status === 200, r.status);
}
r = await get("/admin/login");
check("staff sign-in page is not indexed", /noindex/.test(r.headers.get("x-robots-tag") ?? "") || /noindex/.test(await r.text()));
r = await get("/definitely-not-a-page");
check("unknown pages return 404", r.status === 404, r.status);

r = await get("/admin");
check("practice area redirects signed-out visitors to sign in", r.status === 307 && /\/admin\/login/.test(r.headers.get("location") ?? ""), `${r.status} ${r.headers.get("location")}`);
r = await get("/portal");
check("client portal redirects signed-out visitors to sign in", r.status === 307 && /\/login/.test(r.headers.get("location") ?? ""), `${r.status} ${r.headers.get("location")}`);
r = await get("/api/portal/export");
check("client data export requires sign-in", r.status === 401, r.status);
r = await get("/api/admin/leads", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://evil.example" }, body: "{}" });
check("cross-site writes are refused", r.status === 403, r.status);

r = await get("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "smoke-test-nobody@example.invalid", password: "not-a-real-password" }) });
check("sign-in rejects unknown accounts without leaking detail", r.status === 401 || r.status === 429, r.status);

if (checkProxy) {
  const statuses = [];
  for (let i = 0; i < 21; i++) {
    const res = await get("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": `198.51.100.${i + 1}` },
      body: JSON.stringify({ email: `smoke-proxy-${i}@example.invalid`, password: "not-a-real-password" }),
    });
    statuses.push(res.status);
  }
  check(
    "rate limits see the real visitor address (forged X-Forwarded-For is ignored)",
    statuses.includes(429),
    `got ${statuses.join(",")} — if no 429, set TRUSTED_PROXY_COUNT correctly before launch (see DEPLOY-HOSTINGER.md)`
  );
}

console.log(`\n${failed ? `${failed} check(s) failed` : "All smoke checks passed"} for ${base}`);
process.exit(failed ? 1 : 0);
