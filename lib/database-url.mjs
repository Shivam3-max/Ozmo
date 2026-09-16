/**
 * The MySQL connection string, built from the separate fields hPanel gives you:
 *
 *   DB_HOST (default localhost), DB_PORT (default 3306), DB_NAME, DB_USER, DB_PASSWORD
 *
 * Keeping them separate means nobody has to hand-assemble a URL or remember to
 * percent-encode a password containing @ or #, which silently breaks the
 * connection. Pool limits matter on shared hosting, so they are always applied:
 * DB_CONNECTION_LIMIT (default 5) and DB_POOL_TIMEOUT (default 10 seconds).
 *
 * A full DATABASE_URL still wins when it is set, for CI, local work and tools
 * that expect one.
 */
/** @typedef {Record<string, string | undefined>} Environment */

export const DATABASE_FIELDS = ["DB_NAME", "DB_USER", "DB_PASSWORD"];

const DEFAULTS = { DB_HOST: "localhost", DB_PORT: "3306", DB_CONNECTION_LIMIT: "5", DB_POOL_TIMEOUT: "10" };

/** @type {(env: Environment, name: string) => string} */
const read = (env, name) => (env[name] ?? "").trim();
/** @type {(env: Environment, name: keyof typeof DEFAULTS) => string} */
const value = (env, name) => read(env, name) || DEFAULTS[name];

/**
 * Which required database fields are missing. Empty when the configuration is complete.
 * @param {Environment} [env]
 */
export function missingDatabaseFields(env = process.env) {
  if (read(env, "DATABASE_URL")) return [];
  return DATABASE_FIELDS.filter((name) => !read(env, name));
}

/**
 * True when the connection details come from the separate fields rather than a URL.
 * @param {Environment} [env]
 */
export const usingDatabaseFields = (env = process.env) => !read(env, "DATABASE_URL");

/** @param {Environment} [env] */
export function databaseUrl(env = process.env) {
  const url = read(env, "DATABASE_URL");
  if (url) return url;

  const missing = missingDatabaseFields(env);
  if (missing.length) {
    throw new Error(
      `Database configuration is incomplete: set ${missing.join(", ")} (or a full DATABASE_URL). See .env.example.`
    );
  }

  const port = value(env, "DB_PORT");
  if (!/^\d+$/.test(port)) throw new Error(`DB_PORT must be a number, got "${port}".`);

  const credentials = `${encodeURIComponent(read(env, "DB_USER"))}:${encodeURIComponent(read(env, "DB_PASSWORD"))}`;
  const database = encodeURIComponent(read(env, "DB_NAME"));
  const params = new URLSearchParams({
    connection_limit: value(env, "DB_CONNECTION_LIMIT"),
    pool_timeout: value(env, "DB_POOL_TIMEOUT"),
  });
  return `mysql://${credentials}@${value(env, "DB_HOST")}:${port}/${database}?${params}`;
}

/**
 * Safe for logs and error messages: host, port and database only, never the password.
 * @param {Environment} [env]
 */
export function describeDatabase(env = process.env) {
  try {
    const { hostname, port, pathname } = new URL(databaseUrl(env));
    return `${hostname}:${port}${pathname}`;
  } catch {
    return "(not configured)";
  }
}
