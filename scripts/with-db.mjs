// Runs a command with DATABASE_URL built from the separate DB_* fields, for
// tools that expect a single connection string (the Prisma CLI, mainly).
//
//   node scripts/with-db.mjs npx prisma migrate deploy
//
// An argument that is exactly '$DATABASE_URL' is replaced with the connection
// string, for commands that want it as a value rather than an environment
// variable (prisma migrate diff --from-url '$DATABASE_URL').
//
// The URL itself is never printed: it contains the database password.
// Loads .env the same way Next.js and the env validator do, so local runs work too.
import "dotenv/config";
import { spawnSync } from "node:child_process";
import { databaseUrl, describeDatabase } from "../lib/database-url.mjs";

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("Usage: node scripts/with-db.mjs <command> [args…]");
  process.exit(2);
}

let url;
try {
  url = databaseUrl();
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(2);
}

console.log(`Using database ${describeDatabase()}`);
// Windows needs a shell to run npx, and a shell would treat the & in a
// connection string as a command separator, so quote anything risky.
const shell = process.platform === "win32";
const quote = (arg) => (shell && /[\s&|<>^"]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg);
const result = spawnSync(command, args.map((arg) => quote(arg === "$DATABASE_URL" ? url : arg)), {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
  shell,
});
process.exit(result.status ?? 1);
