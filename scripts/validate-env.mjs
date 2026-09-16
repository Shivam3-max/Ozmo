import "dotenv/config";
import { databaseUrl as buildDatabaseUrl, describeDatabase, usingDatabaseFields } from "../lib/database-url.mjs";

const errors = [];

const authSecret = process.env.AUTH_SECRET?.trim();
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
const dietitianPassword = process.env.SEED_DIETITIAN_PASSWORD;

function fail(message) {
  errors.push(message);
}

// The .env template ships with obvious placeholders; a deploy must not start with
// them. Only this application's own settings are checked, so an unrelated variable
// in a hosting panel can't fail the build.
const OURS = [
  "DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT", "DB_CONNECTION_LIMIT", "DB_POOL_TIMEOUT",
  "DATABASE_URL", "AUTH_SECRET", "NEXT_PUBLIC_SITE_URL", "TRUSTED_PROXY_COUNT", "ERROR_WEBHOOK_URL",
  "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "EMAIL_FROM", "CLINIC_NOTIFY_EMAIL",
  "DOCUMENT_ENCRYPTION_KEY", "SEED_ADMIN_EMAIL", "SEED_ADMIN_PASSWORD", "SEED_DIETITIAN_EMAIL", "SEED_DIETITIAN_PASSWORD",
];
const OPTIONAL = new Set(["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "EMAIL_FROM", "CLINIC_NOTIFY_EMAIL", "ERROR_WEBHOOK_URL", "DOCUMENT_ENCRYPTION_KEY", "SEED_ADMIN_PASSWORD", "SEED_DIETITIAN_PASSWORD"]);
const PLACEHOLDER = /^(REPLACE_ME|CHANGE_ME|replace-with-|generate-a-|generate-another-|your-)/i;
for (const name of OURS) {
  const value = process.env[name];
  if (typeof value === "string" && PLACEHOLDER.test(value.trim())) {
    fail(
      OPTIONAL.has(name)
        ? `${name} still holds a placeholder — set the real value, or remove the variable entirely if you aren't using it yet.`
        : `${name} still holds a placeholder — set the real value.`
    );
  }
}

let connectionUrl = null;
try {
  connectionUrl = buildDatabaseUrl();
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

if (connectionUrl) {
  try {
    const parsed = new URL(connectionUrl);
    if (parsed.protocol !== "mysql:") fail("The database connection must use MySQL.");
    if (!parsed.username) fail("DB_USER is required.");
    if (!parsed.password) fail("DB_PASSWORD is required.");
    if (!parsed.pathname || parsed.pathname === "/") fail("DB_NAME is required.");
    if (!parsed.searchParams.has("connection_limit")) fail("connection_limit is missing (set DB_CONNECTION_LIMIT).");
    if (!parsed.searchParams.has("pool_timeout")) fail("pool_timeout is missing (set DB_POOL_TIMEOUT).");
    if (usingDatabaseFields()) console.log(`Database: ${describeDatabase()} (from DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD)`);
    else console.warn("Warning: DATABASE_URL is set, so the DB_* fields are ignored.");
  } catch {
    fail("The database connection details are not valid.");
  }
}

if (!authSecret) {
  fail("AUTH_SECRET is required.");
} else if (authSecret.length < 32) {
  fail("AUTH_SECRET must be at least 32 characters.");
}

if (!siteUrl) {
  fail("NEXT_PUBLIC_SITE_URL is required.");
} else {
  try {
    const parsed = new URL(siteUrl);
    if (parsed.protocol !== "https:") fail("NEXT_PUBLIC_SITE_URL must use https://.");
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      fail("NEXT_PUBLIC_SITE_URL must be the public production domain, not localhost.");
    }
    if (siteUrl.endsWith("/")) fail("NEXT_PUBLIC_SITE_URL must not have a trailing slash.");
  } catch {
    fail("NEXT_PUBLIC_SITE_URL is not a valid URL.");
  }
}

for (const [name, value] of [
  ["SEED_ADMIN_PASSWORD", adminPassword],
  ["SEED_DIETITIAN_PASSWORD", dietitianPassword],
]) {
  if (value !== undefined && value.length < 20) {
    fail(`${name} must be at least 20 characters when provided — this one is ${value.length}. Four or five hyphenated words work well.`);
  }
}

if (adminPassword && dietitianPassword && adminPassword === dietitianPassword) {
  fail("SEED_ADMIN_PASSWORD and SEED_DIETITIAN_PASSWORD must be different.");
}

const errorWebhook = process.env.ERROR_WEBHOOK_URL?.trim();
if (errorWebhook) {
  try {
    if (new URL(errorWebhook).protocol !== "https:") fail("ERROR_WEBHOOK_URL must use https://.");
  } catch {
    fail("ERROR_WEBHOOK_URL is not a valid URL.");
  }
} else {
  console.warn("Warning: ERROR_WEBHOOK_URL is not set — server errors will only appear in the application log.");
}

const smtpHost = process.env.SMTP_HOST?.trim();
const emailFrom = process.env.EMAIL_FROM?.trim();
if (smtpHost || emailFrom) {
  // Half-configured email is worse than none: it looks set up and silently sends nothing.
  if (!smtpHost) fail("EMAIL_FROM is set but SMTP_HOST is not — add SMTP_HOST (and SMTP_USER/SMTP_PASSWORD), or remove EMAIL_FROM to leave email switched off.");
  if (!emailFrom) fail("SMTP_HOST is set but EMAIL_FROM is not — add EMAIL_FROM, or remove SMTP_HOST to leave email switched off.");
  const port = Number(process.env.SMTP_PORT ?? 465);
  if (!Number.isInteger(port) || port < 1 || port > 65535) fail("SMTP_PORT must be a port number (usually 465 or 587).");
  if (process.env.SMTP_USER && !process.env.SMTP_PASSWORD) fail("SMTP_PASSWORD is required when SMTP_USER is set.");
} else {
  console.warn("Warning: SMTP_HOST / EMAIL_FROM are not set — invites, appointment details and reports won't be emailed.");
}

const notifyEmail = process.env.CLINIC_NOTIFY_EMAIL?.trim();
if (notifyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail)) fail("CLINIC_NOTIFY_EMAIL must be an email address.");

const documentKey = process.env.DOCUMENT_ENCRYPTION_KEY?.trim();
if (documentKey) {
  if (Buffer.from(documentKey, "base64").length !== 32) {
    fail("DOCUMENT_ENCRYPTION_KEY must be 32 bytes, base64-encoded (openssl rand -base64 32).");
  }
} else {
  console.warn("Warning: DOCUMENT_ENCRYPTION_KEY is not set — document uploads are turned off.");
}

if (errors.length) {
  console.error("Deployment environment validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Deployment environment validation passed.");
