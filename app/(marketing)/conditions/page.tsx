import type { Metadata } from "next";
import Link from "next/link";
import { Button, Section, Arrow } from "@/components/ui";
import PageHero from "@/components/PageHero";
import { conditions, conditionGroups } from "@/lib/conditions";

export const metadata: Metadata = {
  title: "Nutrition for Health Conditions",
  description:
    "Nutrition guidance for weight, diabetes, PCOS, thyroid, cholesterol, digestion, sports and more. Find the approach that fits your concern.",
  alternates: { canonical: "/conditions" },
};

export default function ConditionsPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Conditions" }]}
        badge="Ten concerns, ten approaches"
        title={<>What are you <span className="hl">dealing with?</span></>}
        lead="Different concerns need genuinely different nutrition approaches. Find yours — or take the assessment and we'll help you place it."
        primary={{ href: "/assessment", label: "Take the free assessment" }}
        secondary={{ href: "/programs", label: "See programmes" }}
      />

      <Section backdrop="grid">
        <div className="grid gap-12">
          {conditionGroups.map((group) => {
            const items = conditions.filter((c) => c.group === group);
            if (!items.length) return null;
            return (
              <div key={group}>
                <div className="flex items-center gap-4">
                  <h2 className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--accent-text)]">
                    {group}
                  </h2>
                  <span className="h-px flex-1 bg-[var(--line)]" aria-hidden />
                  <span className="tabular text-[13px] text-[var(--ink-3)]">
                    {String(items.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/conditions/${c.slug}`}
                      className="group flex flex-col rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--ink)]/25 hover:shadow-[0_16px_38px_rgba(15,46,61,0.09)]"
                    >
                      <span className="block text-[18px] font-semibold leading-snug">{c.name}</span>
                      <span className="mt-2 block text-[14.5px] leading-snug text-[var(--ink-2)]">
                        {c.cardBlurb}
                      </span>
                      <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--accent-text)]">
                        Read more <Arrow />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section tone="navy" backdrop="grid">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="text-[clamp(34px,5.2vw,58px)]">Not sure where you fit?</h2>
          <p className="mx-auto mt-5 max-w-[50ch] text-[17px] leading-relaxed text-white/75">
            Plenty of people arrive knowing only that something feels off. The assessment exists
            precisely to figure that out.
          </p>
          <div className="mt-8 flex justify-center">
            <Button href="/assessment" variant="accent">Take the free assessment <Arrow /></Button>
          </div>
        </div>
      </Section>
    </>
  );
}
