// Runs before every `npm run build` (npm's prebuild hook), so a host that only
// offers "npm run build" still gets a correct deployment:
//
//   1. check the environment            (refuses to build on a bad configuration)
//   2. generate the Prisma client
//   3. apply database migrations        (the tables the new code expects)
//   4. create the first staff accounts  (only while SEED_* passwords are set)
//
// Every step must pass, so a broken deployment fails here and the previous
// version keeps serving.
import "dotenv/config";
import { spawnSync } from "node:child_process";
import { databaseUrl, describeDatabase } from "../lib/database-url.mjs";

const shell = process.platform === "win32";
const quote = (arg) => (shell && /[\s&|<>^"]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg);

function step(label, command, args, env = {}) {
  console.log(`\n▸ ${label}`);
  const result = spawnSync(command, args.map(quote), { stdio: "inherit", env: { ...process.env, ...env }, shell });
  if (result.status !== 0) {
    console.error(`\n✖ ${label} failed — deployment stopped before building.`);
    process.exit(result.status ?? 1);
  }
}

step("Checking the environment", "node", ["scripts/validate-env.mjs"]);

let url;
try {
  url = databaseUrl();
} catch (err) {
  console.error(`\n✖ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}

step("Generating the database client", "npx", ["prisma", "generate"]);
step(`Applying migrations to ${describeDatabase()}`, "npx", ["prisma", "migrate", "deploy"], { DATABASE_URL: url });

if (process.env.SEED_ADMIN_PASSWORD && process.env.SEED_DIETITIAN_PASSWORD) {
  step("Creating the first staff accounts", "npx", ["prisma", "db", "seed"], { DATABASE_URL: url });
  console.log("\n  Sign in with both accounts, then remove SEED_ADMIN_PASSWORD and");
  console.log("  SEED_DIETITIAN_PASSWORD from the environment and deploy again.");
} else {
  console.log("\n▸ Skipping first-run setup (no SEED_ADMIN_PASSWORD / SEED_DIETITIAN_PASSWORD)");
}

console.log("\n✔ Ready to build\n");
