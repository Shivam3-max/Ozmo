import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentClient } from "@/lib/portal";
import { CLINIC_TIME_ZONE } from "@/lib/clinic-time";
import { periodLabel } from "@/lib/services/reports";
import { documentsConfigured } from "@/lib/documents/crypto";
import { CLIENT_DOCUMENT_TYPES, DOCUMENT_LABEL, type DocumentTypeValue } from "@/lib/documents/files";
import UploadDocument from "@/components/UploadDocument";

export const dynamic = "force-dynamic";

const card = "rounded-2xl border border-[var(--line)] bg-[var(--paper)]";
const heading = "mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]";
const longDate = (d: Date) => d.toLocaleDateString("en-IN", { timeZone: CLINIC_TIME_ZONE, day: "numeric", month: "long", year: "numeric" });

export default async function ReportsPage() {
  const client = await currentClient();
  if (!client) return null;

  const [documents, plans, reports] = await Promise.all([
    // Staff can keep internal documents off the portal; only shared ones are listed.
    prisma.document.findMany({
      where: { clientId: client.id, visibleToClient: true },
      select: { id: true, title: true, type: true, createdAt: true, uploadedById: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.dietPlan.findMany({
      where: { clientId: client.id, status: { in: ["ACTIVE", "ARCHIVED"] } },
      orderBy: { version: "desc" },
      select: { id: true, title: true, version: true, status: true, publishedAt: true, updatedAt: true },
    }),
    prisma.progressReport.findMany({
      where: { clientId: client.id, status: "SENT" },
      select: { id: true, periodStart: true, periodEnd: true },
      orderBy: { periodEnd: "desc" },
    }),
  ]);

  return (
    <>
      <h1 className="font-[var(--font-display)] text-[clamp(24px,4vw,30px)] font-bold tracking-[-0.02em]">My reports</h1>
      <p className="mt-1.5 text-[14.5px] text-[var(--ink-3)]">
        Everything in one place — no more hunting through WhatsApp.
      </p>

      <section className="mt-6">
        <h2 className={heading}>Your plans</h2>
        {plans.length === 0 ? (
          <div className={`${card} px-6 py-7`}>
            <p className="text-[15px] text-[var(--ink-2)]">Your first plan will appear here once it&rsquo;s published.</p>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {plans.map((p) => (
              <div key={p.id} className={`${card} flex flex-wrap items-center gap-3 px-5 py-4`}>
                <div className="min-w-0 flex-1">
                  <p className="text-[15.5px] font-semibold">{p.title}</p>
                  <p className="tabular mt-0.5 text-[13px] text-[var(--ink-3)]">
                    Version {p.version} · {longDate(p.publishedAt ?? p.updatedAt)}
                  </p>
                </div>
                {p.status === "ACTIVE" ? (
                  <Link href="/portal/plan" className="shrink-0 rounded-full bg-[var(--ink)] px-4 py-2 text-[13.5px] font-semibold text-white">
                    Open
                  </Link>
                ) : (
                  <span className="shrink-0 text-[12.5px] text-[var(--ink-3)]">Previous version</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className={heading}>Progress reports</h2>
        {reports.length === 0 ? (
          <div className={`${card} px-6 py-7`}>
            <p className="text-[15px] leading-relaxed text-[var(--ink-2)]">
              Your dietitian writes a progress report as your programme goes on. It will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {reports.map((r) => (
              <Link key={r.id} href={`/portal/reports/${r.id}`} className={`${card} flex flex-wrap items-center gap-3 px-5 py-4 hover:border-[var(--ink)]`}>
                <div className="min-w-0 flex-1">
                  <p className="text-[15.5px] font-semibold">Progress report</p>
                  <p className="tabular mt-0.5 text-[13px] text-[var(--ink-3)]">{periodLabel(r.periodStart, r.periodEnd)}</p>
                </div>
                <span className="shrink-0 text-[13.5px] font-semibold text-[var(--accent-text)]">Read →</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className={heading}>Documents</h2>
        {documents.length === 0 ? (
          <div className={`${card} px-6 py-7`}>
            <p className="text-[15px] leading-relaxed text-[var(--ink-2)]">
              Lab reports and other documents you or your dietitian share will collect here.
            </p>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {documents.map((d) => (
              <a
                key={d.id}
                href={`/api/documents/${d.id}?as=client`}
                target="_blank"
                rel="noopener"
                className={`${card} flex flex-wrap items-center gap-3 px-5 py-4 hover:border-[var(--ink)]`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[15.5px] font-semibold">{d.title}</p>
                  <p className="tabular mt-0.5 text-[13px] text-[var(--ink-3)]">
                    {DOCUMENT_LABEL[d.type as DocumentTypeValue] ?? "Document"}
                    {d.uploadedById === client.userId ? " · shared by you" : ""} · {longDate(d.createdAt)}
                  </p>
                </div>
                <span className="shrink-0 text-[13.5px] font-semibold text-[var(--accent-text)]">Open →</span>
              </a>
            ))}
          </div>
        )}
      </section>

      {documentsConfigured() && (
        <section className={`${card} mt-8 px-6 py-6`}>
          <h2 className="text-[16px] font-semibold">Share a document with your dietitian</h2>
          <p className="mb-4 mt-1 max-w-[62ch] text-[14px] leading-relaxed text-[var(--ink-2)]">
            Blood test results or a prescription help your dietitian adjust your plan. Only the clinic team can see what you share.
          </p>
          <UploadDocument endpoint="/api/portal/documents" types={CLIENT_DOCUMENT_TYPES} submitLabel="Share" />
        </section>
      )}
    </>
  );
}
