import "dotenv/config";

const errors = [];

const databaseUrl = process.env.DATABASE_URL?.trim();
const authSecret = process.env.AUTH_SECRET?.trim();
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
const dietitianPassword = process.env.SEED_DIETITIAN_PASSWORD;

function fail(message) {
  errors.push(message);
}

if (!databaseUrl) {
  fail("DATABASE_URL is required.");
} else {
  try {
    const parsed = new URL(databaseUrl);
    if (parsed.protocol !== "mysql:") fail("DATABASE_URL must use the mysql:// scheme.");
    if (!parsed.username) fail("DATABASE_URL must include a database user.");
    if (!parsed.password) fail("DATABASE_URL must include a database password.");
    if (!parsed.pathname || parsed.pathname === "/") fail("DATABASE_URL must include a database name.");
    if (!parsed.searchParams.has("connection_limit")) fail("DATABASE_URL must set connection_limit for shared hosting.");
    if (!parsed.searchParams.has("pool_timeout")) fail("DATABASE_URL must set pool_timeout for shared hosting.");
  } catch {
    fail("DATABASE_URL is not a valid URL.");
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
    fail(`${name} must be at least 20 characters when provided.`);
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
  if (!smtpHost) fail("SMTP_HOST is required when EMAIL_FROM is set.");
  if (!emailFrom) fail("EMAIL_FROM is required when SMTP_HOST is set.");
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
