/** Offset pagination for staff lists. Clinic-scale data, so offsets are fine. */
export function pageFrom(value: string | string[] | undefined) {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n >= 1 && n <= 10_000 ? n : 1;
}

export function paging(page: number, size: number) {
  return { skip: (page - 1) * size, take: size };
}

export type PageInfo = { page: number; size: number; total: number; pages: number };

export function pageInfo(page: number, size: number, total: number): PageInfo {
  return { page, size, total, pages: Math.max(1, Math.ceil(total / size)) };
}

/** Builds a list URL that keeps the current filters and changes only the page. */
export function pageHref(base: string, params: Record<string, string | undefined>, page: number) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value && key !== "page") qs.set(key, value);
  if (page > 1) qs.set("page", String(page));
  const s = qs.toString();
  return s ? `${base}?${s}` : base;
}
