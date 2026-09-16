import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { currentClient } from "@/lib/portal";
import MessageThread from "@/components/portal/MessageThread";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const session = await getSession("client");
  const client = await currentClient();
  if (!client || !session) return null;

  const thread =
    (await prisma.messageThread.findUnique({
      where: { clientId: client.id },
      include: { messages: { orderBy: { createdAt: "asc" }, include: { sender: true }, take: 200 } },
    })) ?? (await prisma.messageThread.create({ data: { clientId: client.id }, include: { messages: { include: { sender: true } } } }));

  // Opening the thread clears the client's unread badge.
  if (thread.clientUnread > 0) {
    await prisma.messageThread.update({ where: { id: thread.id }, data: { clientUnread: 0 } });
  }

  const dietitian = client.primaryDietitian?.name.split(" ")[0] ?? "your dietitian";

  return (
    <>
      <h1 className="font-[var(--font-display)] text-[clamp(24px,4vw,30px)] font-bold tracking-[-0.02em]">Messages</h1>
      <p className="mt-1.5 text-[14.5px] text-[var(--ink-3)]">With {client.primaryDietitian?.name ?? "your dietitian"}</p>

      <div className="mt-6">
        <MessageThread
          threadId={thread.id}
          dietitian={dietitian}
          messages={thread.messages.map((m) => ({
            id: m.id,
            body: m.body,
            createdAt: m.createdAt.toISOString(),
            mine: m.senderId === session.sub,
            sender: m.sender.name.split(" ")[0],
          }))}
        />
      </div>
    </>
  );
}
