import Link from "next/link";
import { currentClient } from "@/lib/portal";
import { asStrings } from "@/lib/json";
import DataControls from "@/components/portal/DataControls";
import PasswordFields from "@/components/PasswordFields";
import SignOutEverywhere from "@/components/SignOutEverywhere";
import { PASSWORD_MIN } from "@/lib/password-policy";
import { formatPhone } from "@/lib/phone";
import { CLINIC_TIME_ZONE } from "@/lib/clinic-time";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const client = await currentClient();
  if (!client) return null;

  const enrollment = client.enrollments[0];
  const allergies = asStrings(client.allergies);
  const realEmail = !client.user.email.endsWith("@no-email.ozmo.local");

  return (
    <>
      <h1 className="font-[var(--font-display)] text-[clamp(24px,4vw,30px)] font-bold tracking-[-0.02em]">
        Profile &amp; settings
      </h1>

      <section className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">You</h2>
        <dl className="mt-3.5 grid gap-2.5 text-[15px]">
          {[
            ["Name", client.user.name],
            ["Client code", client.clientCode],
            ["Phone", formatPhone(client.user.phone) || "—"],
            ["Email", realEmail ? client.user.email : "not on file"],
            ["Height", client.heightCm ? `${client.heightCm} cm` : "—"],
            ["Food preference", client.foodPreference ?? "—"],
            ["Allergies", allergies.length ? allergies.join(", ") : "none recorded"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-[var(--ink-3)]">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-[13px] leading-relaxed text-[var(--ink-3)]">
          Something here wrong — especially your allergies or a medication?{" "}
          <Link href="/portal/messages" className="font-semibold underline">Tell your dietitian</Link>.
          Health details are changed by her, so the record stays accurate.
        </p>
      </section>

      {enrollment && (
        <section className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">Your programme</h2>
          <p className="mt-3 font-[var(--font-display)] text-[20px] font-bold">{enrollment.program.name}</p>
          <dl className="mt-3 grid gap-2.5 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--ink-3)]">Started</dt>
              <dd className="tabular">{enrollment.startDate.toLocaleDateString("en-IN", { timeZone: CLINIC_TIME_ZONE, day: "numeric", month: "long", year: "numeric" })}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--ink-3)]">Ends</dt>
              <dd className="tabular">{enrollment.endDate.toLocaleDateString("en-IN", { timeZone: CLINIC_TIME_ZONE, day: "numeric", month: "long", year: "numeric" })}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--ink-3)]">Follow-ups</dt>
              <dd className="tabular">{enrollment.followUpsUsed} of {enrollment.followUpsIncluded} used</dd>
            </div>
          </dl>
        </section>
      )}

      <section className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">Password</h2>
        <p className="mb-4 mt-2 text-[14px] leading-relaxed text-[var(--ink-2)]">
          Changing it signs you out on every other phone or computer.
        </p>
        <PasswordFields mode="change" scope="client" endpoint="/api/auth/password" minLength={PASSWORD_MIN} submitLabel="Change password" />
      </section>

      <section className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">Devices</h2>
        <p className="mb-4 mt-2 text-[14px] leading-relaxed text-[var(--ink-2)]">
          Logging out signs out this device only. Lost a phone, or used a computer that isn&rsquo;t yours? Sign out
          everywhere at once.
        </p>
        <SignOutEverywhere scope="client" redirectTo="/login" />
      </section>

      <section className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">Your data</h2>
        <div className="mt-3.5">
          <DataControls latestRequest={client.dataRequests[0] ? {
            status: client.dataRequests[0].status,
            requestedAt: client.dataRequests[0].requestedAt.toISOString(),
          } : null} />
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--tint)] p-5">
        <p className="text-[13.5px] leading-relaxed text-[var(--ink-2)]">
          Ozmo provides nutrition and lifestyle guidance. It does not diagnose or treat medical
          conditions and does not replace your doctor. Read the{" "}
          <Link href="/medical-disclaimer" className="underline">medical disclaimer</Link> and{" "}
          <Link href="/privacy-policy" className="underline">privacy policy</Link>.
        </p>
      </section>
    </>
  );
}
