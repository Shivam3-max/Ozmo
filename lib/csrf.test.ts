import { describe, expect, it } from "vitest";
import { crossSiteRejection } from "./csrf";

const SITE = "https://ozmodietclinic.com";
const h = (entries: Record<string, string>) => new Headers(entries);

describe("crossSiteRejection", () => {
  it("never blocks reads", () => {
    expect(crossSiteRejection("GET", h({ "sec-fetch-site": "cross-site" }), SITE)).toBeNull();
  });

  it("allows same-origin writes", () => {
    expect(crossSiteRejection("POST", h({ "sec-fetch-site": "same-origin" }), SITE)).toBeNull();
    expect(crossSiteRejection("POST", h({ origin: SITE, host: "localhost:3000" }), SITE)).toBeNull();
    // Behind the hosting proxy the Host header is internal but X-Forwarded-Host is public.
    expect(crossSiteRejection("PATCH", h({ origin: "https://ozmodietclinic.com", host: "127.0.0.1:3000", "x-forwarded-host": "ozmodietclinic.com" }), undefined)).toBeNull();
  });

  it("blocks writes a browser sent from another site or a sibling subdomain", () => {
    expect(crossSiteRejection("POST", h({ "sec-fetch-site": "cross-site" }), SITE)).not.toBeNull();
    expect(crossSiteRejection("POST", h({ "sec-fetch-site": "same-site" }), SITE)).not.toBeNull();
    expect(crossSiteRejection("POST", h({ origin: "https://evil.example", host: "ozmodietclinic.com" }), SITE)).not.toBeNull();
    expect(crossSiteRejection("DELETE", h({ origin: "null" }), SITE)).not.toBeNull();
  });

  it("allows requests with no browser provenance headers (not a CSRF vector)", () => {
    expect(crossSiteRejection("POST", h({}), SITE)).toBeNull();
  });
});
