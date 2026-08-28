import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Prisma 7 takes a driver adapter rather than a connection string.
 * Swapping to Postgres later means importing PrismaPg from
 * @prisma/adapter-pg here and changing the provider in schema.prisma —
 * nothing else in the app touches the driver.
 */
const makeClient = () =>
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof makeClient> };

export const prisma = globalForPrisma.prisma ?? makeClient();

// Next's dev server hot-reloads modules; without this every reload opens a new pool.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
