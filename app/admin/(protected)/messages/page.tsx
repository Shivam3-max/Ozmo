import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireStaff, canSeeHealthData } from "@/lib/auth";
import { CLINIC_ID } from "@/lib/leads";
import { PageTitle, Panel, Flag, Empty, timeAgo } from "@/components/admin/ui";
import ReplyBox from "@/components/admin/ReplyBox";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const user = await requireStaff();
  if (!canSeeHealthData(user.role)) {
    return <Panel className="px-6 py-8"><p className="text-[15px] text-[var(--ink-2)]">Not part of your role&rsquo;s access.</p></Panel>;
  }

  const threads = await prisma.messageThread.findMany({
    where: { client: { clinicId: CLINIC_ID } },
    // Oldest unanswered first — newest-first is how messages get missed.
    orderBy: [{ staffUnread: "desc" }, { lastMessageAt: "asc" }],
    include: {
      client: { include: { user: true } },
      messages: { orderBy: { createdAt: "asc" }, include: { sender: true }, take: 40 },
    },
  });

  const waiting = threads.filter((t) => t.staffUnread > 0);
  const active = threads.filter((t) => t.messages.length > 0);

  return (
    <>
      <PageTitle
        title="Messages"
        sub={`${waiting.length} waiting on a reply · ${active.length} active ${active.length === 1 ? "thread" : "threads"}`}
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
                            {m.createdAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
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
    </>
  );
}
