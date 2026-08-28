import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Client Log In",
  description: "Log in to your Ozmo client dashboard.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Section backdrop="both">
      <div className="mx-auto max-w-[440px] rounded-[26px] border border-[var(--line)] bg-[var(--paper)] p-9 shadow-[0_22px_56px_rgba(15,46,61,0.09)]">
        <h1 className="text-[clamp(30px,4vw,38px)]">Log in to Ozmo</h1>
        <p className="mt-3 text-[16px] leading-relaxed text-[var(--ink-2)]">
          Your plan, your progress and your dietitian — all in one place.
        </p>

        <form className="mt-8 grid gap-5">
          <label className="grid gap-2">
            <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">
              Mobile number
            </span>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              className="min-h-[50px] rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 text-[16px]"
            />
          </label>
          <button
            type="button"
            className="inline-flex min-h-[54px] items-center justify-center rounded-full bg-[var(--ink)] px-6 text-[16px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#163B4D]"
          >
            Send me an OTP
          </button>
        </form>

        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--tint)] px-5 py-4">
          <p className="text-[14.5px] leading-relaxed text-[var(--ink-2)]">
            The client dashboard is being rolled out to Ozmo clients. If you&rsquo;re already on a
            programme and need your login, message us and we&rsquo;ll set it up.
          </p>
        </div>

        <p className="mt-8 text-[15px] text-[var(--ink-2)]">
          Not a client yet? <Link href="/assessment" className="underline">Start with the free assessment</Link>.
        </p>
      </div>
    </Section>
  );
}
