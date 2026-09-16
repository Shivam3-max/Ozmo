const DEFAULT_SITE_URL = "https://ozmodietclinic.com";

function normalizedBaseUrl(raw: string) {
  const url = new URL(raw);
  url.pathname = "";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

export function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;

  try {
    const base = normalizedBaseUrl(configured);
    const url = new URL(base);

    if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
      throw new Error("NEXT_PUBLIC_SITE_URL must use https in production.");
    }

    return base;
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }

    return DEFAULT_SITE_URL;
  }
}

export function absoluteUrl(path = "/") {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
