/**
 * Json columns are nullable in the schema (Prisma emits an unquoted `DEFAULT {}`
 * for Json defaults, which SQLite rejects), so reads normalise here instead.
 */

export function asArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function asObject<T extends object = Record<string, unknown>>(value: unknown): T {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as T;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as T) : ({} as T);
    } catch {
      return {} as T;
    }
  }
  return {} as T;
}

export function asStrings(value: unknown): string[] {
  return asArray(value).filter((v): v is string => typeof v === "string");
}
