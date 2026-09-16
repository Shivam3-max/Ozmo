/**
 * Server error reporting.
 *
 * Every unhandled error becomes one JSON line on stdout (Hostinger keeps the
 * application log), and — when ERROR_WEBHOOK_URL is set — is also POSTed to
 * that URL, so an alerting service (Slack/Discord webhook, Better Stack, a
 * Sentry-compatible relay…) can page someone.
 *
 * What is sent is deliberately thin: error class, database code and column,
 * route and request id. Never messages, query arguments, headers or bodies —
 * those can carry names, phone numbers and health answers.
 */
export type ErrorReport = {
  source: "request" | "api" | "client-boundary";
  method?: string;
  path?: string;
  route?: string;
  digest?: string;
};

type ErrorShape = Error & { code?: string; digest?: string; meta?: Record<string, unknown> };

export function errorFingerprint(err: unknown) {
  if (!(err instanceof Error)) return { name: typeof err };
  const e = err as ErrorShape;
  return {
    name: e.name,
    ...(e.code ? { code: e.code } : {}),
    ...(typeof e.meta?.column_name === "string" ? { column: e.meta.column_name } : {}),
    ...(typeof e.meta?.modelName === "string" ? { model: e.meta.modelName } : {}),
  };
}

/** Strips query strings and one-time tokens (setup links, snapshots) from a path before it's logged or sent anywhere. */
export function safePath(path?: string) {
  if (!path) return undefined;
  return path
    .split("?")[0]
    .replace(/\/portal\/setup\/[^/]+/, "/portal/setup/[token]")
    .replace(/\/admin\/setup\/[^/]+/, "/admin/setup/[token]")
    .replace(/\/assessment\/snapshot\/[^/]+/, "/assessment/snapshot/[token]");
}

export async function reportError(err: unknown, report: ErrorReport) {
  const entry = {
    level: "error",
    at: new Date().toISOString(),
    ...report,
    path: safePath(report.path),
    digest: report.digest ?? (err as ErrorShape | undefined)?.digest,
    error: errorFingerprint(err),
  };
  console.error(JSON.stringify(entry));

  const webhook = process.env.ERROR_WEBHOOK_URL;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `Ozmo error: ${entry.error.name}${entry.error.code ? ` ${entry.error.code}` : ""} at ${entry.method ?? ""} ${entry.path ?? entry.route ?? ""}`, ...entry }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Reporting must never take the request down with it.
  }
}
