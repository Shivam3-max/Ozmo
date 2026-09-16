import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { can } from "@/lib/policy";
import { formatClinic } from "@/lib/clinic-time";
import { LEGAL_REVIEW_REQUIRED, retentionPreview } from "@/lib/retention";
import { PageTitle, Panel, th, td } from "@/components/admin/ui";
import RunRetention from "@/components/admin/RunRetention";

export const dynamic = "force-dynamic";

export default async function RetentionPage() {
  const user = await requireStaff();
  if (!can(user.role, "retention.run")) {
    return (
      <Panel className="px-6 py-8">
        <p className="text-[15px] text-[var(--ink-2)]">Only the clinic administrator can manage data retention.</p>
      </Panel>
    );
  }

  const [preview, lastRun] = await Promise.all([
    retentionPreview(user.clinicId),
    prisma.auditLog.findFirst({ where: { clinicId: user.clinicId, action: "RETENTION_RUN" }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
  ]);
  const total = preview.reduce((n, r) => n + r.count, 0);

  return (
    <>
      <PageTitle
        title="Data retention"
        sub={lastRun ? `Last clean-up ${formatClinic(lastRun.createdAt, { day: "numeric", month: "short", year: "numeric" })}` : "No clean-up has run yet"}
      />
      <p className="mb-5 max-w-[70ch] text-[14px] leading-relaxed text-[var(--ink-2)]">
        Data the clinic no longer needs is removed on a schedule. Client health records are never removed here — only when
        a client asks, from <strong className="font-semibold">Data requests</strong>.
      </p>
      {LEGAL_REVIEW_REQUIRED && (
        <Panel className="mb-5 border-[var(--watch)]/40 px-5 py-4">
          <p className="text-[14px] leading-relaxed text-[var(--ink-2)]">
            <strong className="font-semibold text-[var(--ink)]">These periods are defaults awaiting legal review.</strong> Confirm them
            with the clinic&rsquo;s adviser and match the privacy policy before relying on them.
          </p>
        </Panel>
      )}

      <Panel className="mb-5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>What</th>
                <th className={th}>Removed when</th>
                <th className={`${th} text-right`}>Due now</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((r) => (
                <tr key={r.label}>
                  <td className={`${td} font-semibold`}>{r.label}</td>
                  <td className={`${td} text-[13.5px] text-[var(--ink-2)]`}>{r.rule}</td>
                  <td className={`${td} tabular text-right font-semibold`}>{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <RunRetention total={total} />
    </>
  );
}
