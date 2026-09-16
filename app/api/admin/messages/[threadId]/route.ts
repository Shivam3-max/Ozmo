import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";

export const runtime = "nodejs";

const schema = z.object({ body: z.string().trim().min(1).max(4000) });

export const POST = apiHandler(async function POST(req: Request, ctx: { params: Promise<{ threadId: string }> }) {
  const session = await authorize("messages.reply");

  const { threadId } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Write a reply first." }, { status: 422 });

  const thread = await prisma.messageThread.findFirst({
    where: { id: threadId, client: { clinicId: session.clinicId } },
  });
  if (!thread) return NextResponse.json({ error: "Thread not found." }, { status: 404 });

  await prisma.message.create({
    data: { threadId, senderId: session.sub, body: parsed.data.body },
  });
  await prisma.messageThread.update({
    where: { id: threadId },
    data: { lastMessageAt: new Date(), clientUnread: { increment: 1 }, staffUnread: 0 },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
});
