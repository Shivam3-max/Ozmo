import { PrismaClient } from "@prisma/client";
import { databaseUrl } from "./database-url.mjs";

/**
 * Hostinger MySQL is the single source of truth in production. The connection
 * details come from the separate DB_* fields (see lib/database-url.mjs), or from
 * DATABASE_URL when one is set.
 */
const makeClient = () =>
  new PrismaClient({
    datasourceUrl: databaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof makeClient> };

export const prisma = globalForPrisma.prisma ?? makeClient();

// Next's dev server hot-reloads modules; without this every reload opens a new pool.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
