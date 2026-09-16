import type { Instrumentation } from "next";

/**
 * Reports server errors Next.js catches outside our API wrapper — page and
 * layout rendering, proxy — through the same redacted channel as the API.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const { reportError } = await import("@/lib/observability");
  await reportError(err, {
    source: "request",
    method: request.method,
    path: request.path,
    route: `${context.routeType}:${context.routePath}`,
  });
};
