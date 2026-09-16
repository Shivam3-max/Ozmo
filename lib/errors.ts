/**
 * An expected failure with a message meant for the person using the app —
 * "that time overlaps another appointment", "only the administrator can…".
 * Services throw it; lib/api.ts turns it into a JSON response with this status.
 */
export class ServiceError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly extra: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export const notFound = (what: string) => new ServiceError(404, `${what} not found.`);
export const conflict = (message: string, extra?: Record<string, unknown>) => new ServiceError(409, message, extra);
export const invalid = (message: string, extra?: Record<string, unknown>) => new ServiceError(422, message, extra);
export const forbidden = (message = "Your role doesn't allow this.") => new ServiceError(403, message);
