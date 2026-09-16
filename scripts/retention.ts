/**
 * Scheduled retention job. Add it in hPanel → Advanced → Cron Jobs, e.g. weekly:
 *   cd <app directory> && npm run retention:run
 * `npm run retention:preview` shows the counts without removing anything.
 * Output is counts only — never names or record contents.
 */
import "dotenv/config";
import { prisma } from "../lib/db.ts";
import { LEGAL_REVIEW_REQUIRED, retentionPreview, runRetention } from "../lib/retention.ts";

const dryRun = process.argv.includes("--dry-run");

async function main() {
  if (LEGAL_REVIEW_REQUIRED) console.warn("Note: retention periods are defaults awaiting legal review (lib/retention.ts).");
  const clinics = await prisma.clinic.findMany({ select: { id: true } });
  for (const clinic of clinics) {
    const report = dryRun ? await retentionPreview(clinic.id) : await runRetention(clinic.id);
    const removed = Object.fromEntries(report.map((r) => [r.label, r.count]));
    if (!dryRun) {
      await prisma.auditLog.create({
        data: { clinicId: clinic.id, action: "RETENTION_RUN", entityType: "Clinic", entityId: clinic.id, changes: { scheduled: true, removed } },
      });
    }
    console.log(JSON.stringify({ clinic: clinic.id, dryRun, report: removed }));
  }
}

main()
  .catch((err) => {
    console.error(JSON.stringify({ event: "retention_failed", name: err?.name, code: err?.code }));
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
