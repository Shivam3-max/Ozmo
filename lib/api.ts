import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { Prisma } from "@prisma/client";
import { reportError } from "@/lib/observability";
import { ServiceError } from "@/lib/errors";

const humanize = (column: string) => column.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();

/**
 * Turns an error a user can act on into a clear 4xx; anything else is reported
 * and becomes a plain 500 without internal detail.
 */
export async function errorResponse(err: unknown, req?: Request) {
  if (err instanceof ServiceError) {
    return NextResponse.json({ error: err.message, ...err.extra }, { status: err.status });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const column = typeof err.meta?.column_name === "string" ? err.meta.column_name : null;
    switch (err.code) {
      case "P2000":
        return NextResponse.json(
          { error: column ? `The ${humanize(column)} is too long.` : "One of the values is too long.", field: column },
          { status: 422 }
        );
      case "P2002":
        return NextResponse.json({ error: "That already exists — it may have just been saved." }, { status: 409 });
      case "P2025":
        return NextResponse.json({ error: "That record no longer exists. Reload and try again." }, { status: 404 });
      case "P2034":
        return NextResponse.json({ error: "Someone else saved at the same moment. Please try again." }, { status: 409 });
    }
  }

  const url = req ? new URL(req.url) : null;
  await reportError(err, { source: "api", method: req?.method, path: url?.pathname });
  return NextResponse.json({ error: "Something went wrong on our side. Please try again." }, { status: 500 });
}

/**
 * Wraps a route handler so database constraint errors become useful 4xx
 * responses and unexpected failures are reported once, consistently.
 */
export function apiHandler<Args extends unknown[]>(handler: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      unstable_rethrow(err); // let Next's own control-flow errors through
      return errorResponse(err, args[0] instanceof Request ? args[0] : undefined);
    }
  };
}
