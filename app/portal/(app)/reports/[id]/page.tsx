import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentClient } from "@/lib/portal";
import { asReportData, periodLabel } from "@/lib/services/reports";
import { formatClinic } from "@/lib/clinic-time";
import { ReportFigures, ReportText } from "@/components/ReportView";

export const dynamic = "force-dynamic";

export default async function PortalReportPage({ params }: { params: Promise<{ id: string }> }) {
  const client = await currentClient();
  if (!client) return null;
  const { id } = await params;
  // Only reports the dietitian approved and shared are ever visible here.
  const report = await prisma.progressReport.findFirst({ where: { id, clientId: client.id, status: "SENT" } });
  if (!report) notFound();
  const data = asReportData(report.data);

  return (
    <>
      <Link href="/portal/reports" className="text-[13.5px] text-[var(--ink-3)] hover:text-[var(--ink)]">← My reports</Link>
      <h1 className="mt-3 font-[var(--font-display)] text-[clamp(24px,4vw,30px)] font-bold tracking-[-0.02em]">Progress report</h1>
      <p className="mt-1.5 text-[14.5px] text-[var(--ink-3)]">
        {periodLabel(report.periodStart, report.periodEnd)}
        {report.sentAt ? ` · shared ${formatClinic(report.sentAt, { day: "numeric", month: "long" })}` : ""}
      </p>

      <div className="mt-6 grid gap-6">
        <div className="grid gap-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-6 py-6">
          <ReportText title="From your dietitian" body={report.observations} />
          <ReportText title="Your focus for next month" body={report.nextMonthFocus} />
        </div>
        {data && (
          <section className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-6 py-5">
            <h2 className="mb-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">Your numbers</h2>
            <ReportFigures data={data} />
          </section>
        )}
      </div>
    </>
  );
}
