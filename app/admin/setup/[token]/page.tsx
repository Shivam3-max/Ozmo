import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { isStaffRole } from "@/lib/policy";

import { roleLabel } from "@/lib/staff";
import { STAFF_PASSWORD_MIN } from "@/lib/password-policy";
import Logo from "@/components/Logo";
import PasswordFields from "@/components/PasswordFields";

export const metadata: Metadata = { title: "Set Your Password", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function StaffSetupPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
    select: { name: true, role: true, isActive: true, deletedAt: true, inviteExpiresAt: true, passwordHash: true },
  });
  const valid = Boolean(
    user && isStaffRole(user.role) && user.isActive && !user.deletedAt && user.inviteExpiresAt && user.inviteExpiresAt > new Date()
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--tint)] px-6 py-16">
      <div className="w-full max-w-[440px] rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-8">
        <Logo size={22} />
        {valid && user ? (
          <>
            <h1 className="mt-6 font-[var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">
              {user.passwordHash ? "Choose a new password" : `Welcome, ${user.name.split(" ")[0]}`}
            </h1>
            <p className="mb-6 mt-2 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
              Your Ozmo staff account ({roleLabel(user.role).toLowerCase()}) opens client health records, so pick
              something only you know. This link works once.
            </p>
            <PasswordFields mode="setup" endpoint="/api/auth/staff-setup" token={token} minLength={STAFF_PASSWORD_MIN} submitLabel="Save and sign in" redirectTo="/admin" />
          </>
        ) : (
          <>
            <h1 className="mt-6 font-[var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">This link has expired</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-2)]">
              Staff links expire quickly and work once. Ask the clinic administrator to send you a new one from
              Practice → Staff.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
