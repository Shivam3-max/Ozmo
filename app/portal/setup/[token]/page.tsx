import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import SetupForm from "@/components/portal/SetupForm";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SetupPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
    select: { name: true, inviteExpiresAt: true, role: true },
  });

  const valid = Boolean(user && user.role === "CLIENT" && user.inviteExpiresAt && user.inviteExpiresAt > new Date());

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--tint)] px-6 py-16">
      <div className="w-full max-w-[420px] rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-8">
        {valid ? (
          <SetupForm token={token} name={user!.name.split(" ")[0]} />
        ) : (
          <>
            <h1 className="font-[var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">
              This link has expired
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-2)]">
              Setup links last two weeks. Message the clinic and they&rsquo;ll send you a fresh one —
              it takes them a moment.
            </p>
            <a href="/contact" className="mt-6 inline-flex min-h-[46px] items-center rounded-full border border-[var(--line)] px-5 text-[15px] font-semibold">
              Contact the clinic
            </a>
          </>
        )}
      </div>
    </div>
  );
}
