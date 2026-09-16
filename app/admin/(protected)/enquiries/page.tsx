import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { formatPhone } from "@/lib/phone";
import { formatClinic } from "@/lib/clinic-time";
import { pageFrom, pageInfo, paging } from "@/lib/pagination";
import { PageTitle, Panel, Flag, Empty, timeAgo } from "@/components/admin/ui";
import Pager from "@/components/admin/Pager";
import EnquiryActions from "@/components/admin/EnquiryActions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;
const VIEWS = [
  { key: "open", label: "To handle", where: { handledAt: null } },
  { key: "handled", label: "Handled", where: { handledAt: { not: null } } },
  { key: "all", label: "All", where: {} },
] as const;

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ view?: string; page?: string }> }) {
  const user = await requireStaff();
  const { view: rawView = "open", page: rawPage } = await searchParams;
  const view = VIEWS.find((v) => v.key === rawView) ?? VIEWS[0];
  const page = pageFrom(rawPage);

  const where: Prisma.ContactMessageWhereInput = { clinicId: user.clinicId, ...(view.where as Prisma.ContactMessageWhereInput) };
  const [total, open, messages] = await Promise.all([
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count({ where: { clinicId: user.clinicId, handledAt: null } }),
    prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, ...paging(page, PAGE_SIZE) }),
  ]);

  const handlerIds = [...new Set(messages.map((m) => m.handledById).filter((x): x is string => Boolean(x)))];
  const handlers = handlerIds.length
    ? await prisma.user.findMany({ where: { id: { in: handlerIds } }, select: { id: true, name: true } })
    : [];
  const handlerName = (id: string | null) => handlers.find((h) => h.id === id)?.name ?? "a staff member";

  return (
    <>
      <PageTitle title="Enquiries" sub={`${open} to handle`} />

      <div className="mb-4 flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <Link
            key={v.key}
            href={`/admin/enquiries?view=${v.key}`}
            className={`rounded-full px-3.5 py-2 text-[13px] font-semibold ${
              v.key === view.key ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)]"
            }`}
          >
            {v.label}
          </Link>
        ))}
      </div>

      {messages.length === 0 ? (
        <Panel>
          <Empty
            title={view.key === "open" ? "Nothing waiting" : "No enquiries here"}
            body="Messages sent through the contact form arrive here. Mark each one handled once someone has replied."
          />
        </Panel>
      ) : (
        <div className="grid gap-4">
          {messages.map((m) => (
            <Panel key={m.id} className="px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="break-words font-[var(--font-display)] text-[18px] font-bold">{m.name}</p>
                    {!m.handledAt && <Flag tone="watch">new</Flag>}
                  </div>
                  <p className="tabular mt-1 break-all text-[13.5px] text-[var(--ink-2)]">
                    {formatPhone(m.phone)}
                    {m.email ? ` · ${m.email}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-[var(--ink-2)]">{m.topic}</p>
                  <p className="text-[12.5px] text-[var(--ink-3)]">{timeAgo(m.createdAt)}</p>
                </div>
              </div>
              {/* overflow-wrap keeps a long unbroken string inside the card instead of widening the page */}
              <p className="mt-4 whitespace-pre-wrap [overflow-wrap:anywhere] rounded-lg bg-[var(--tint)] px-4 py-3 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
                {m.message}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] text-[var(--ink-3)]">
                  {m.handledAt
                    ? `Handled by ${handlerName(m.handledById)} · ${formatClinic(m.handledAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`
                    : "Not handled yet"}
                </p>
                <EnquiryActions id={m.id} handled={Boolean(m.handledAt)} />
              </div>
            </Panel>
          ))}
        </div>
      )}
      <Pager info={pageInfo(page, PAGE_SIZE, total)} base="/admin/enquiries" params={{ view: view.key }} noun="enquiries" />
    </>
  );
}
