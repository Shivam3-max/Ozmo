import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { PageTitle, Panel, Flag, Empty, timeAgo } from "@/components/admin/ui";
import ReplyBox from "@/components/admin/ReplyBox";
import { CLINIC_TIME_ZONE } from "@/lib/clinic-time";
import { pageFrom, pageInfo, paging } from "@/lib/pagination";
import Pager from "@/components/admin/Pager";
import { can } from "@/lib/policy";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireStaff();
  if (!can(user.role, "health.read")) {
    return <Panel className="px-6 py-8"><p className="text-[15px] text-[var(--ink-2)]">Not part of your role&rsquo;s access.</p></Panel>;
  }

  const page = pageFrom((await searchParams).page);
  const where = { client: { clinicId: user.clinicId }, messages: { some: {} } };
  const [total, waitingCount, rawThreads] = await Promise.all([
    prisma.messageThread.count({ where }),
    prisma.messageThread.count({ where: { ...where, staffUnread: { gt: 0 } } }),
    prisma.messageThread.findMany({
      where,
      // Oldest unanswered first — newest-first is how messages get missed.
      orderBy: [{ staffUnread: "desc" }, { lastMessageAt: "asc" }],
      ...paging(page, PAGE_SIZE),
      include: {
        client: { include: { user: true } },
        // The latest 30, shown oldest to newest. Taking the first 30 would hide every new reply in a long thread.
        messages: { orderBy: { createdAt: "desc" }, include: { sender: true }, take: 30 },
      },
    }),
  ]);
  const threads = rawThreads.map((t) => ({ ...t, messages: [...t.messages].reverse() }));
  await prisma.auditLog.create({ data: { clinicId: user.clinicId, actorId: user.sub, action: "CLIENT_MESSAGES_VIEWED", entityType: "MessageThread", entityId: "list" } });

  const active = threads;

  return (
    <>
      <PageTitle
        title="Messages"
        sub={`${waitingCount} waiting on a reply · ${total} active ${total === 1 ? "thread" : "threads"}`}
      />

      {active.length === 0 ? (
        <Panel>
          <Empty title="No messages yet" body="When a client writes from their dashboard, the thread appears here — oldest unanswered first." />
        </Panel>
      ) : (
        <div className="grid gap-5">
          {active.map((t) => {
            const last = t.messages.at(-1);
            return (
              <Panel key={t.id} className="px-6 py-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link href={`/admin/clients/${t.clientId}`} className="font-[var(--font-display)] text-[18px] font-bold hover:text-[var(--accent-text)]">
                    {t.client.user.name}
                  </Link>
                  <span className="tabular text-[12.5px] text-[var(--ink-3)]">{t.client.clientCode}</span>
                  {t.staffUnread > 0 && <Flag tone="watch">{t.staffUnread} waiting</Flag>}
                  <span className="ml-auto text-[12.5px] text-[var(--ink-3)]">
                    {last ? timeAgo(last.createdAt) : ""}
                  </span>
                </div>

                <div className="mt-4 grid gap-2.5">
                  {t.messages.slice(-8).map((m) => {
                    const fromStaff = m.senderId !== t.client.userId;
                    return (
                      <div key={m.id} className={`flex ${fromStaff ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${fromStaff ? "bg-[var(--ink)] text-white" : "bg-[var(--tint)]"}`}>
                          <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed">{m.body}</p>
                          <p className={`tabular mt-1 text-[11.5px] ${fromStaff ? "text-white/55" : "text-[var(--ink-3)]"}`}>
                            {fromStaff ? m.sender.name.split(" ")[0] : "Client"} ·{" "}
                            {m.createdAt.toLocaleString("en-IN", { timeZone: CLINIC_TIME_ZONE, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <ReplyBox threadId={t.id} name={t.client.user.name.split(" ")[0]} />
              </Panel>
            );
          })}
        </div>
      )}
      <Pager info={pageInfo(page, PAGE_SIZE, total)} base="/admin/messages" params={{}} noun="threads" />
    </>
  );
}
