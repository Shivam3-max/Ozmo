import { PrismaClient } from "@prisma/client";
import { databaseUrl } from "./database-url.mjs";

/**
 * Hostinger MySQL is the single source of truth in production. The connection
 * details come from the separate DB_* fields (see lib/database-url.mjs), or from
 * DATABASE_URL when one is set.
 *
 * The URL is assembled here rather than passed to the client, so importing this
 * module never requires database settings — unit tests import modules that reach
 * this file without ever opening a connection. A genuinely missing configuration
 * is caught by `npm run validate:env` at deploy time, and by /api/health at runtime.
 */
if (!process.env.DATABASE_URL) {
  try {
    process.env.DATABASE_URL = databaseUrl();
  } catch {
    // Left unset: Prisma reports it on the first query, and the health check fails.
  }
}

const makeClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof makeClient> };

export const prisma = globalForPrisma.prisma ?? makeClient();

// Next's dev server hot-reloads modules; without this every reload opens a new pool.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
