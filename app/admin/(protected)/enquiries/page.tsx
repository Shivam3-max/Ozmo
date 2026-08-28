import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { CLINIC_ID } from "@/lib/leads";
import { PageTitle, Panel, Flag, Empty, timeAgo } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function EnquiriesPage() {
  await requireStaff();

  const messages = await prisma.contactMessage.findMany({
    where: { clinicId: CLINIC_ID },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const unhandled = messages.filter((m) => !m.handledAt).length;

  return (
    <>
      <PageTitle title="Enquiries" sub={`${messages.length} received · ${unhandled} not yet handled`} />

      {messages.length === 0 ? (
        <Panel>
          <Empty title="No enquiries yet" body="Messages sent through the contact form arrive here." />
        </Panel>
      ) : (
        <div className="grid gap-4">
          {messages.map((m) => (
            <Panel key={m.id} className="px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="font-[var(--font-display)] text-[18px] font-bold">{m.name}</p>
                    {!m.handledAt && <Flag tone="watch">new</Flag>}
                  </div>
                  <p className="tabular mt-1 text-[13.5px] text-[var(--ink-2)]">
                    {m.phone}
                    {m.email ? ` · ${m.email}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-[var(--ink-2)]">{m.topic}</p>
                  <p className="text-[12.5px] text-[var(--ink-3)]">{timeAgo(m.createdAt)}</p>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap rounded-lg bg-[var(--tint)] px-4 py-3 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
                {m.message}
              </p>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
