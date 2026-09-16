import { PrismaClient } from "@prisma/client";

/**
 * Hostinger MySQL is the single source of truth in production. DATABASE_URL
 * should use the local Hostinger DB hostname to avoid remote latency.
 */
const makeClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof makeClient> };

export const prisma = globalForPrisma.prisma ?? makeClient();

// Next's dev server hot-reloads modules; without this every reload opens a new pool.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
