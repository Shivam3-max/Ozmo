import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/portal/", "/admin/", "/api/", "/login", "/assessment/snapshot/"],
    },
    sitemap: "https://ozmodietclinic.com/sitemap.xml",
  };
}
