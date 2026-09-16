// Verifies a database restore: compares every table's row count and checks the
// migration history and a few integrity rules in the restored copy.
//
//   SOURCE_DATABASE_URL=mysql://… RESTORED_DATABASE_URL=mysql://… npm run restore:check
//
// Point RESTORED_DATABASE_URL at a separate scratch database (e.g. ozmo_restore_test),
// never at production. Read-only on both. Prints counts only, never row contents.
import { PrismaClient } from "@prisma/client";

const sourceUrl = process.env.SOURCE_DATABASE_URL;
const restoredUrl = process.env.RESTORED_DATABASE_URL;
if (!sourceUrl || !restoredUrl) {
  console.error("Set SOURCE_DATABASE_URL and RESTORED_DATABASE_URL.");
  process.exit(2);
}
if (sourceUrl === restoredUrl) {
  console.error("SOURCE and RESTORED point at the same database — restore into a separate scratch database.");
  process.exit(2);
}

const source = new PrismaClient({ datasourceUrl: sourceUrl });
const restored = new PrismaClient({ datasourceUrl: restoredUrl });
let failed = 0;
const check = (label, ok, detail = "") => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  (${detail})` : ""}`);
};

const tables = async (db) =>
  (await db.$queryRawUnsafe("SELECT table_name AS t FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE' ORDER BY table_name"))
    .map((r) => r.t ?? r.TABLE_NAME);
const count = async (db, table) => Number((await db.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM \`${table.replace(/`/g, "")}\``))[0].n);

try {
  const [a, b] = await Promise.all([tables(source), tables(restored)]);
  check("restored database has every table", a.length === b.length && a.every((t) => b.includes(t)), `${b.length}/${a.length}`);

  let mismatches = a.filter((t) => !b.includes(t)).length;
  if (a.length === 0) mismatches++;
  for (const t of a.filter((x) => b.includes(x))) {
    const [ca, cb] = await Promise.all([count(source, t), count(restored, t)]);
    if (ca !== cb) {
      mismatches++;
      console.log(`      ${t}: source ${ca}, restored ${cb}`);
    }
  }
  check("row counts match for every table", mismatches === 0, mismatches ? `${mismatches} differ — expected only if the source changed after the backup` : `${a.length} tables`);

  const migrations = async (db) => (await db.$queryRawUnsafe("SELECT migration_name AS m FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL ORDER BY migration_name")).map((r) => r.m);
  const [ma, mb] = await Promise.all([migrations(source), migrations(restored)]);
  check("migration history matches", ma.join() === mb.join(), `${mb.length} applied`);

  const orphanFiles = Number((await restored.$queryRawUnsafe("SELECT COUNT(*) AS n FROM DocumentFile f LEFT JOIN Document d ON d.id = f.documentId WHERE d.id IS NULL"))[0].n);
  check("no document files without their document", orphanFiles === 0, String(orphanFiles));
  const clientsWithoutUser = Number((await restored.$queryRawUnsafe("SELECT COUNT(*) AS n FROM Client c LEFT JOIN User u ON u.id = c.userId WHERE u.id IS NULL"))[0].n);
  check("every client has its account", clientsWithoutUser === 0, String(clientsWithoutUser));
  const staff = await restored.user.count({ where: { role: "SUPER_ADMIN", isActive: true, deletedAt: null } });
  check("at least one active administrator can sign in", staff >= 1, String(staff));
} catch (err) {
  failed++;
  console.error(`FAIL  could not compare databases: ${err?.name ?? "Error"} ${err?.code ?? ""}`);
} finally {
  await Promise.all([source.$disconnect(), restored.$disconnect()]);
}

console.log(failed ? `\n${failed} restore check(s) failed` : "\nRestore verified");
process.exit(failed ? 1 : 0);
