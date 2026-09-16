import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/portal/", "/admin/", "/api/", "/login", "/assessment/snapshot/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
