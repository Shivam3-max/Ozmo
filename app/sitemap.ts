import type { MetadataRoute } from "next";
import { programs } from "@/lib/programs";
import { conditions } from "@/lib/conditions";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const statics = [
    ["", 1],
    ["/programs", 0.9],
    ["/conditions", 0.9],
    ["/assessment", 0.9],
    ["/how-it-works", 0.8],
    ["/about", 0.7],
    ["/about/dietitian", 0.7],
    ["/book", 0.8],
    ["/faq", 0.6],
    ["/contact", 0.6],
    ["/stories", 0.5],
    ["/privacy-policy", 0.3],
    ["/terms", 0.3],
    ["/medical-disclaimer", 0.3],
    ["/refund-policy", 0.3],
  ] as const;

  return [
    ...statics.map(([path, priority]) => ({
      url: absoluteUrl(path),
      lastModified: now,
      priority,
    })),
    ...programs.map((p) => ({ url: absoluteUrl(`/programs/${p.slug}`), lastModified: now, priority: 0.8 })),
    ...conditions.map((c) => ({ url: absoluteUrl(`/conditions/${c.slug}`), lastModified: now, priority: 0.8 })),
  ];
}
