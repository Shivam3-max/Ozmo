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

type ErrorShape = Error & { code?: string; errorCode?: string; digest?: string; meta?: Record<string, unknown> };

export function errorFingerprint(err: unknown) {
  if (!(err instanceof Error)) return { name: typeof err };
  const e = err as ErrorShape;
  return {
    name: e.name,
    // Prisma reports connection problems (P1000 wrong password, P1001 unreachable,
    // P1003 no such database) on errorCode rather than code.
    ...(e.code || e.errorCode ? { code: e.code ?? e.errorCode } : {}),
    ...(typeof e.meta?.column_name === "string" ? { column: e.meta.column_name } : {}),
    ...(typeof e.meta?.modelName === "string" ? { model: e.meta.modelName } : {}),
  };
}

/**
 * Why a database connection failed, in words that point at the setting to fix.
 * Prisma puts the detail in the message, which is never logged (it can quote the
 * connection), so only these fixed phrases are used.
 */
export function databaseFailureReason(err: unknown): string | undefined {
  const message = err instanceof Error ? err.message : "";
  if (/Unknown database|database .* does not exist/i.test(message)) return "no such database — check DB_NAME";
  if (/Access denied[\s\S]*to database/i.test(message)) return "that user cannot open that database — check DB_NAME, and that the user is granted access to it";
  if (/Authentication failed|Access denied/i.test(message)) return "authentication failed — check DB_USER and DB_PASSWORD";
  if (/Can't reach database server|ECONNREFUSED|connection refused/i.test(message)) return "cannot reach the server — check DB_HOST and DB_PORT, and that MySQL is running";
  if (/timed out|ETIMEDOUT/i.test(message)) return "connection timed out — check DB_HOST, DB_PORT and any firewall";
  if (/Environment variable not found|DATABASE_URL/i.test(message)) return "no connection details — set DB_NAME, DB_USER and DB_PASSWORD";
  if (/too many connections|connection limit/i.test(message)) return "too many connections — lower DB_CONNECTION_LIMIT";
  return undefined;
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
