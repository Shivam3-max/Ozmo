import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 keeps connection URLs out of the schema. Migrate reads the URL from
// here; the runtime client gets a driver adapter instead (see lib/db.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});
