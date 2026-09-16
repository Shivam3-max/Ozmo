import { requireStaff } from "@/lib/auth";
import { roleLabel } from "@/lib/staff";
import { STAFF_PASSWORD_MIN } from "@/lib/password-policy";
import { PageTitle, Panel } from "@/components/admin/ui";
import PasswordFields from "@/components/PasswordFields";
import SignOutEverywhere from "@/components/SignOutEverywhere";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireStaff();
  return (
    <>
      <PageTitle title="Your account" sub={`${user.name} · ${user.email} · ${roleLabel(user.role)}`} />
      <Panel className="max-w-[560px] px-6 py-6">
        <h2 className="text-[16px] font-semibold">Change password</h2>
        <p className="mb-5 mt-1 text-[14px] leading-relaxed text-[var(--ink-2)]">
          This signs you out everywhere else. If you&rsquo;ve forgotten your current password, ask the clinic
          administrator for a reset link.
        </p>
        <PasswordFields mode="change" scope="staff" endpoint="/api/auth/password" minLength={STAFF_PASSWORD_MIN} submitLabel="Change password" />
      </Panel>
      <Panel className="mt-6 max-w-[560px] px-6 py-6">
        <h2 className="text-[16px] font-semibold">Signed in somewhere you shouldn&rsquo;t be?</h2>
        <p className="mb-4 mt-1 text-[14px] leading-relaxed text-[var(--ink-2)]">
          Signing out from the menu ends this device only. Use this if you lost a phone or used a shared computer —
          it ends every session, including this one.
        </p>
        <SignOutEverywhere scope="staff" redirectTo="/admin/login" />
      </Panel>
    </>
  );
}
