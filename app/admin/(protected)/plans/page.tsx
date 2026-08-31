import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireStaff, canEditPlans } from "@/lib/auth";
import { CLINIC_ID } from "@/lib/leads";
import { asStrings } from "@/lib/json";
import { PageTitle, Panel, Flag, Empty, th, td, timeAgo } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const user = await requireStaff();
  const { cat = "", q = "" } = await searchParams;
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
      <PageTitle title="Diet plans" sub={`${templates.length} templates · ${plans.length} client plans`} />

      {/* templates, grouped by the category tag */}
      {(() => {
        const needle = q.trim().toLowerCase();
        const withCat = templates.map((t) => {
          const tags = asStrings(t.tags);
          return { t, tags, cat: tags[0] ?? "other" };
        });
        const categories = [...new Set(withCat.map((x) => x.cat))].sort();
        const shown = withCat.filter(
          (x) =>
            (!cat || x.cat === cat) &&
            (!needle ||
              x.t.name.toLowerCase().includes(needle) ||
              (x.t.description ?? "").toLowerCase().includes(needle) ||
              x.tags.some((tg) => tg.includes(needle)))
        );
        const grouped = shown.reduce<Record<string, typeof shown>>((acc, x) => {
          (acc[x.cat] ||= []).push(x);
          return acc;
        }, {});

        return (
          <section className="mb-10">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--accent-text)]">
                Template library · {shown.length} of {templates.length}
              </h2>
              <form action="/admin/plans" className="flex gap-2">
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search templates…"
                  className="min-h-[38px] w-[220px] rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 text-[14px]"
                />
                {cat && <input type="hidden" name="cat" value={cat} />}
                <button className="min-h-[38px] rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 text-[13.5px] font-semibold hover:border-[var(--ink)]">
                  Search
                </button>
              </form>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              <Link
                href="/admin/plans"
                className={`rounded-full px-3.5 py-2 text-[13px] font-semibold ${
                  !cat ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)]"
                }`}
              >
                All <span className="tabular opacity-60">{templates.length}</span>
              </Link>
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/admin/plans?cat=${encodeURIComponent(c)}`}
                  className={`rounded-full px-3.5 py-2 text-[13px] font-semibold capitalize ${
                    cat === c ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)]"
                  }`}
                >
                  {c} <span className="tabular opacity-60">{withCat.filter((x) => x.cat === c).length}</span>
                </Link>
              ))}
            </div>

            {shown.length === 0 ? (
              <Panel><Empty title="No templates match" body="Try a different category or clear the search." /></Panel>
            ) : (
              <div className="grid gap-6">
                {Object.entries(grouped).map(([group, items]) => (
                  <div key={group}>
                    <p className="mb-2.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)] capitalize">
                      {group} · {items.length}
                    </p>
                    <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                      {items.map(({ t, tags }) => (
                        <Panel key={t.id} className="px-5 py-4">
                          <p className="text-[15.5px] font-semibold leading-snug">{t.name}</p>
                          <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--ink-2)]">{t.description}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            {tags.slice(1, 4).map((tag) => (
                              <span key={tag} className="rounded-full bg-[var(--tint)] px-2.5 py-1 text-[11px] text-[var(--ink-2)]">{tag}</span>
                            ))}
                            {t.timesUsed > 0 && <span className="tabular text-[11px] text-[var(--ink-3)]">used {t.timesUsed}x</span>}
                          </div>
                        </Panel>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-[13px] text-[var(--ink-3)]">
              Start a plan from any of these on a client&rsquo;s page — it copies the whole structure so you edit rather than retype.
            </p>
          </section>
        );
      })()}

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
