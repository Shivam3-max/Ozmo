import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentClient } from "@/lib/portal";

export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = {
  DIET_PLAN: "Diet plan",
  PROGRESS_REPORT: "Progress report",
  CONSULT_NOTE: "Consultation note",
  LAB_REPORT: "Lab report",
  INVOICE: "Invoice",
  OTHER: "Document",
};

export default async function ReportsPage() {
  const client = await currentClient();
  if (!client) return null;

  const [documents, plans] = await Promise.all([
    prisma.document.findMany({ where: { clientId: client.id }, orderBy: { createdAt: "desc" } }),
    prisma.dietPlan.findMany({
      where: { clientId: client.id, status: { in: ["ACTIVE", "ARCHIVED"] } },
      orderBy: { version: "desc" },
      select: { id: true, title: true, version: true, status: true, publishedAt: true, updatedAt: true },
    }),
  ]);

  return (
    <>
      <h1 className="font-[var(--font-display)] text-[clamp(24px,4vw,30px)] font-bold tracking-[-0.02em]">My reports</h1>
      <p className="mt-1.5 text-[14.5px] text-[var(--ink-3)]">
        Everything in one place — no more hunting through WhatsApp.
      </p>

      <section className="mt-6">
        <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">Your plans</h2>
        {plans.length === 0 ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-6 py-7">
            <p className="text-[15px] text-[var(--ink-2)]">Your first plan will appear here once it&rsquo;s published.</p>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {plans.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[15.5px] font-semibold">{p.title}</p>
                  <p className="tabular mt-0.5 text-[13px] text-[var(--ink-3)]">
                    Version {p.version} ·{" "}
                    {(p.publishedAt ?? p.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
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
        <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">Documents</h2>
        {documents.length === 0 ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-6 py-7">
            <p className="text-[15px] leading-relaxed text-[var(--ink-2)]">
              Progress reports, consultation notes and lab reports will collect here as your
              programme goes on.
            </p>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {documents.map((d) => (
              <a
                key={d.id}
                href={d.fileUrl}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-5 py-4 hover:border-[var(--ink)]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[15.5px] font-semibold">{d.title}</p>
                  <p className="tabular mt-0.5 text-[13px] text-[var(--ink-3)]">
                    {LABEL[d.type] ?? "Document"} ·{" "}
                    {d.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <span className="shrink-0 text-[13.5px] font-semibold text-[var(--accent-text)]">Open →</span>
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
