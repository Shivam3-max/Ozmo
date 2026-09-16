import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { can } from "@/lib/policy";
import { formatClinic } from "@/lib/clinic-time";
import { asReportData, periodLabel } from "@/lib/services/reports";
import { Flag, PageTitle, Panel } from "@/components/admin/ui";
import { ReportFigures, ReportText } from "@/components/ReportView";
import ReportEditor from "@/components/admin/ReportEditor";

export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: { params: Promise<{ id: string; reportId: string }> }) {
  const user = await requireStaff();
  if (!can(user.role, "health.read")) notFound();
  const { id, reportId } = await params;

  const report = await prisma.progressReport.findFirst({
    where: { id: reportId, clientId: id, client: { clinicId: user.clinicId, deletedAt: null } },
    include: { client: { include: { user: { select: { name: true } } } } },
  });
  if (!report) notFound();
  const data = asReportData(report.data);
  const people = await prisma.user.findMany({
    where: { id: { in: [report.createdById, report.approvedById].filter((x): x is string => Boolean(x)) } },
    select: { id: true, name: true },
  });
  const nameOf = (uid: string | null) => people.find((p) => p.id === uid)?.name ?? "—";
  const editable = can(user.role, "reports.write");

  return (
    <>
      <Link href={`/admin/clients/${id}`} className="mb-4 inline-block text-[13.5px] text-[var(--ink-3)] hover:text-[var(--ink)]">
        ← {report.client.user.name}
      </Link>
      <PageTitle
        title="Progress report"
        sub={`${report.client.user.name} · ${periodLabel(report.periodStart, report.periodEnd)}`}
        action={
          report.status === "SENT" ? <Flag tone="good">shared</Flag> : report.status === "APPROVED" ? <Flag tone="good">approved</Flag> : <Flag tone="watch">draft</Flag>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel className="px-6 py-6">
          {editable && report.status !== "SENT" ? (
            <ReportEditor
              id={report.id}
              clientId={id}
              status={report.status}
              initial={{ observations: report.observations ?? "", nextMonthFocus: report.nextMonthFocus ?? "" }}
            />
          ) : (
            <div className="grid gap-6">
              <ReportText title="Observations" body={report.observations} />
              <ReportText title="Focus for next month" body={report.nextMonthFocus} />
              {!report.observations && <p className="text-[14px] text-[var(--ink-3)]">The dietitian hasn&rsquo;t written this report yet.</p>}
            </div>
          )}
        </Panel>

        <div className="grid content-start gap-6">
          <Panel className="px-5 py-5">
            <h2 className="mb-2 text-[15px] font-semibold">Figures for the period</h2>
            {data ? <ReportFigures data={data} /> : <p className="text-[14px] text-[var(--ink-3)]">No figures recorded.</p>}
            <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--ink-3)]">
              Drawn from measurements and logs recorded in the period. They&rsquo;re frozen once the report is shared.
            </p>
          </Panel>
          <Panel className="px-5 py-5">
            <dl className="grid gap-2 text-[13.5px]">
              <div className="flex justify-between gap-4"><dt className="text-[var(--ink-3)]">Drafted by</dt><dd>{nameOf(report.createdById)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--ink-3)]">Approved</dt><dd>{report.approvedAt ? `${nameOf(report.approvedById)}, ${formatClinic(report.approvedAt, { day: "numeric", month: "short" })}` : "—"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--ink-3)]">Shared</dt><dd>{report.sentAt ? formatClinic(report.sentAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</dd></div>
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
