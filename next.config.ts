import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["@prisma/client"],
  turbopack: { root: process.cwd() },
  // Matches the largest upload the API accepts (see proxy.ts).
  experimental: { proxyClientMaxBodySize: "6mb" },
  async headers() {
    return [
      {
        // Authenticated surfaces must never be indexed.
        source: "/(portal|admin)/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: blob:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests",
          },
        ],
      },
      {
        // Uploaded documents: never cached, and sandboxed so a file can't run
        // script as the site. Listed last so it replaces the site-wide policy above.
        source: "/api/documents/:id",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Content-Security-Policy", value: "sandbox; default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
