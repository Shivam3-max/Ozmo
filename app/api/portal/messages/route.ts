import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({ body: z.string().trim().min(1, "Write a message").max(4000) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const limit = rateLimit(`msg:${session.sub}:${clientIp(req.headers)}`, 30, 60 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ error: "That's a lot of messages. Try again shortly." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Write a message first." }, { status: 422 });

  const client = await prisma.client.findFirst({
    where: { userId: session.sub, deletedAt: null },
    include: { thread: true },
  });
  if (!client) return NextResponse.json({ error: "No client record." }, { status: 404 });

  const thread =
    client.thread ?? (await prisma.messageThread.create({ data: { clientId: client.id } }));

  await prisma.message.create({
    data: { threadId: thread.id, senderId: session.sub, body: parsed.data.body },
  });
  await prisma.messageThread.update({
    where: { id: thread.id },
    data: { lastMessageAt: new Date(), staffUnread: { increment: 1 } },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
