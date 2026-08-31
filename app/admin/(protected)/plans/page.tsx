import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireStaff, canEditPlans } from "@/lib/auth";
import { CLINIC_ID } from "@/lib/leads";
import { asStrings } from "@/lib/json";
import { PageTitle, Panel, Flag, Empty, th, td, timeAgo } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const user = await requireStaff();
  if (!canEditPlans(user.role)) {
    return <Panel className="px-6 py-8"><p className="text-[15px] text-[var(--ink-2)]">Plans aren&rsquo;t part of your role&rsquo;s access.</p></Panel>;
  }

  const [plans, templates] = await Promise.all([
    prisma.dietPlan.findMany({
      where: { client: { clinicId: CLINIC_ID } },
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: { client: { include: { user: true } }, _count: { select: { days: true } } },
    }),
    prisma.planTemplate.findMany({ where: { clinicId: CLINIC_ID }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageTitle title="Diet plans" sub={`${plans.length} plans · ${templates.length} templates`} />

      <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--accent-text)]">Your templates</h2>
      <div className="mb-8 grid gap-3 md:grid-cols-2">
        {templates.map((t) => (
          <Panel key={t.id} className="px-5 py-4">
            <p className="font-[var(--font-display)] text-[17px] font-bold">{t.name}</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--ink-2)]">{t.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {asStrings(t.tags).map((tag) => (
                <span key={tag} className="rounded-full bg-[var(--tint)] px-2.5 py-1 text-[11.5px] text-[var(--ink-2)]">{tag}</span>
              ))}
              {t.timesUsed > 0 && <span className="tabular px-2 py-1 text-[11.5px] text-[var(--ink-3)]">used {t.timesUsed}×</span>}
            </div>
          </Panel>
        ))}
      </div>

      <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--accent-text)]">Client plans</h2>
      <Panel>
        {plans.length === 0 ? (
          <Empty
            title="No plans written yet"
            body="Open a client and start a plan — blank, or from one of your templates above."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr>
                  <th className={th}>Plan</th>
                  <th className={th}>Client</th>
                  <th className={th}>Version</th>
                  <th className={th}>Structure</th>
                  <th className={th}>Status</th>
                  <th className={th}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--tint)]">
                    <td className={td}>
                      <Link href={`/admin/plans/${p.id}`} className="font-semibold hover:text-[var(--accent-text)]">{p.title}</Link>
                    </td>
                    <td className={`${td} text-[var(--ink-2)]`}>
                      <Link href={`/admin/clients/${p.clientId}`} className="hover:text-[var(--accent-text)]">{p.client.user.name}</Link>
                    </td>
                    <td className={`${td} tabular`}>v{p.version}</td>
                    <td className={`${td} text-[var(--ink-2)]`}>
                      {p.dayMode === "SINGLE" ? "One day" : p.dayMode === "WEEK" ? "Week" : `${p.dayCount} days`}
                    </td>
                    <td className={td}>
                      {p.status === "ACTIVE" ? <Flag tone="good">active</Flag> : p.status === "DRAFT" ? <Flag tone="watch">draft</Flag> : <span className="text-[13px] text-[var(--ink-3)]">archived</span>}
                    </td>
                    <td className={`${td} whitespace-nowrap text-[var(--ink-3)]`}>{timeAgo(p.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
