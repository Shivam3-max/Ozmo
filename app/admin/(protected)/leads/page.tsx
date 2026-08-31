import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireStaff, canSeeHealthData } from "@/lib/auth";
import { CLINIC_ID } from "@/lib/leads";
import { asStrings } from "@/lib/json";
import { PageTitle, Panel, StageTag, Flag, Empty, th, td, timeAgo } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const STAGES = ["ALL", "NEW", "CONTACTED", "CONSULTATION_BOOKED", "CONSULTED", "CONVERTED", "LOST"] as const;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; q?: string }>;
}) {
  const user = await requireStaff();
  const showHealth = canSeeHealthData(user.role);
  const { stage = "ALL", q = "" } = await searchParams;

  const leads = await prisma.lead.findMany({
    where: {
      clinicId: CLINIC_ID,
      ...(stage !== "ALL" && STAGES.includes(stage as (typeof STAGES)[number])
        ? { stage: stage as "NEW" }
        : {}),
      ...(q
        ? { OR: [{ name: { contains: q } }, { phone: { contains: q } }, { email: { contains: q } }] }
        : {}),
    },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    take: 200,
    include: { assessment: { select: { token: true, bmi: true } } },
  });

  const counts = await prisma.lead.groupBy({
    by: ["stage"],
    where: { clinicId: CLINIC_ID },
    _count: true,
  });
  const countFor = (s: string) =>
    s === "ALL"
      ? counts.reduce((n, c) => n + c._count, 0)
      : counts.find((c) => c.stage === s)?._count ?? 0;

  return (
    <>
      <PageTitle
        title="Leads"
        sub="Sorted by score — the most ready people sit at the top."
        action={
          <Link href="/admin/leads/new" className="rounded-full bg-[var(--ink)] px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#163B4D]">
            + Add lead
          </Link>
        }
      />

      <form action="/admin/leads" className="mb-4 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, phone or email…"
          className="min-h-[42px] w-[280px] rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 text-[14.5px]"
        />
        {stage !== "ALL" && <input type="hidden" name="stage" value={stage} />}
        <button className="min-h-[42px] rounded-full border border-[var(--line)] bg-[var(--paper)] px-5 text-[14px] font-semibold hover:border-[var(--ink)]">
          Search
        </button>
        {q && <Link href="/admin/leads" className="self-center text-[13.5px] text-[var(--ink-3)]">Clear</Link>}
      </form>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {STAGES.map((s) => (
          <Link
            key={s}
            href={s === "ALL" ? "/admin/leads" : `/admin/leads?stage=${s}`}
            className={`rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors ${
              stage === s
                ? "bg-[var(--ink)] text-white"
                : "border border-[var(--line)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)]"
            }`}
          >
            {s.replace(/_/g, " ").toLowerCase()}{" "}
            <span className="tabular opacity-60">{countFor(s)}</span>
          </Link>
        ))}
      </div>

      <Panel>
        {leads.length === 0 ? (
          <Empty
            title="Nothing here yet"
            body="Leads arrive from the health assessment, the booking form and the contact form."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead>
                <tr>
                  <th className={th}>Name</th>
                  <th className={th}>Contact</th>
                  <th className={th}>Goal</th>
                  {showHealth && <th className={th}>Conditions</th>}
                  <th className={th}>Score</th>
                  <th className={th}>Stage</th>
                  <th className={th}>Added</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => {
                  const conditions = asStrings(l.conditions).filter((c) => c !== "None of these");
                  return (
                    <tr key={l.id} className="hover:bg-[var(--tint)]">
                      <td className={td}>
                        <Link href={`/admin/leads/${l.id}`} className="font-semibold hover:text-[var(--accent-text)]">
                          {l.name}
                        </Link>
                        <span className="mt-1 flex flex-wrap gap-1.5">
                          {l.assessment && <Flag tone="good">assessed</Flag>}
                          {showHealth && l.requiresMedicalCaution && <Flag tone="alert">caution</Flag>}
                        </span>
                      </td>
                      <td className={`${td} text-[var(--ink-2)]`}>
                        <span className="tabular block">{l.phone}</span>
                        {l.email && <span className="block text-[12.5px] text-[var(--ink-3)]">{l.email}</span>}
                      </td>
                      <td className={`${td} text-[var(--ink-2)]`}>{l.goal ?? "—"}</td>
                      {showHealth && (
                        <td className={`${td} text-[var(--ink-2)]`}>
                          {conditions.length ? conditions.join(", ") : "—"}
                        </td>
                      )}
                      <td className={`${td} tabular font-semibold`}>{l.score}</td>
                      <td className={td}>
                        <StageTag stage={l.stage} />
                      </td>
                      <td className={`${td} whitespace-nowrap text-[var(--ink-3)]`}>{timeAgo(l.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
