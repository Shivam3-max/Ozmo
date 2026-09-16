import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireClient } from "@/lib/auth";
import PortalShell from "@/components/portal/Shell";

export const metadata: Metadata = {
  title: "Your Dashboard",
  robots: { index: false, follow: false },
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireClient();

  const client = await prisma.client.findFirst({
    where: { userId: session.sub, deletedAt: null },
    include: { thread: true },
  });

  // A signed-in user with no client record has nothing to show — send them out
  // rather than rendering an empty dashboard.
  if (!client) redirect("/login");

  return (
    <PortalShell name={session.name.split(" ")[0]} unread={client.thread?.clientUnread ?? 0}>
      {children}
    </PortalShell>
  );
}
