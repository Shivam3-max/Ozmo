import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { asStrings } from "@/lib/json";
import { getProgram } from "@/lib/programs";
import { PageTitle, Panel, Flag, Empty, timeAgo } from "@/components/admin/ui";
import { formatPhone } from "@/lib/phone";
import { pageFrom, pageInfo, paging } from "@/lib/pagination";
import Pager from "@/components/admin/Pager";
import { can } from "@/lib/policy";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;

export default async function AssessmentsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireStaff();
  if (!can(user.role, "health.read")) {
    return (
      <Panel className="px-6 py-8">
        <p className="text-[15px] text-[var(--ink-2)]">
          Assessments contain health data, which isn&rsquo;t part of your role&rsquo;s access.
        </p>
      </Panel>
    );
  }

  const page = pageFrom((await searchParams).page);
  const scope = { lead: { clinicId: user.clinicId } };
  const [total, highReadiness, assessments] = await Promise.all([
    prisma.assessment.count({ where: scope }),
    prisma.assessment.count({ where: { ...scope, readiness: { gte: 4 } } }),
    prisma.assessment.findMany({
      where: scope,
      orderBy: { completedAt: "desc" },
      ...paging(page, PAGE_SIZE),
      include: { lead: true },
    }),
  ]);
  await prisma.auditLog.create({ data: { clinicId: user.clinicId, actorId: user.sub, action: "ASSESSMENT_LIST_VIEWED", entityType: "Assessment", entityId: "list" } });


  return (
    <>
      <PageTitle
        title="Assessments"
        sub={`${total} submitted · ${highReadiness} ready to start now`}
      />

      {assessments.length === 0 ? (
        <Panel>
          <Empty
            title="No assessments yet"
            body="Every completed health assessment lands here with its snapshot, ready to review before you call."
          />
        </Panel>
      ) : (
        <div className="grid gap-4">
          {assessments.map((a) => {
            const conditions = asStrings(a.conditions).filter((c) => c !== "None of these");
            const program = a.recommendedProgram ? getProgram(a.recommendedProgram) : undefined;
            return (
              <Panel key={a.id} className="px-6 py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        href={a.leadId ? `/admin/leads/${a.leadId}` : "#"}
                        className="font-[var(--font-display)] text-[19px] font-bold hover:text-[var(--accent-text)]"
                      >
                        {a.lead?.name ?? "Unnamed"}
                      </Link>
                      {a.requiresMedicalCaution && <Flag tone="alert">medical caution</Flag>}
                      {a.readiness >= 4 && <Flag tone="good">call today</Flag>}
                    </div>
                    <p className="tabular mt-1.5 text-[13.5px] text-[var(--ink-2)]">
                      {a.age ? `${a.age}` : "—"}
                      {a.gender ? `${a.gender[0]}` : ""} · {a.weightKg ?? "—"} kg · BMI {a.bmi ?? "—"} ·{" "}
                      {formatPhone(a.lead?.phone)}
                    </p>
                    <p className="mt-2 text-[14px] text-[var(--ink-2)]">
                      <span className="font-semibold text-[var(--ink)]">{a.goal ?? "No goal set"}</span>
                      {conditions.length > 0 && ` · ${conditions.join(", ")}`}
                    </p>
                    {program && (
                      <p className="mt-1.5 text-[13.5px] text-[var(--ink-3)]">
                        Recommended: {program.name}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-[12.5px] text-[var(--ink-3)]">{timeAgo(a.completedAt)}</span>
                    <div className="flex gap-2">
                      <Link
                        href={`/assessment/snapshot/${a.token}`}
                        target="_blank"
                        className="rounded-full border border-[var(--line)] px-3.5 py-1.5 text-[13px] font-semibold transition-colors hover:border-[var(--ink)]"
                      >
                        Snapshot
                      </Link>
                      {a.leadId && (
                        <Link
                          href={`/admin/leads/${a.leadId}`}
                          className="rounded-full bg-[var(--ink)] px-3.5 py-1.5 text-[13px] font-semibold text-white"
                        >
                          Open
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
      <Pager info={pageInfo(page, PAGE_SIZE, total)} base="/admin/assessments" params={{}} noun="assessments" />
    </>
  );
}
