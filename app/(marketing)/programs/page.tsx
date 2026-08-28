import type { Metadata } from "next";
import Link from "next/link";
import { Button, Section, SectionHeader, Card, Arrow } from "@/components/ui";
import PageHero from "@/components/PageHero";
import { programs } from "@/lib/programs";

export const metadata: Metadata = {
  title: "Nutrition Programmes",
  description:
    "Personalised nutrition programmes for weight, metabolic health, PCOS and thyroid, fitness, gut health and everyday wellness. Consultation, plan, tracking and follow-ups included.",
};

const includedInAll = [
  "Initial consultation",
  "Personalised diet plan",
  "Meal alternatives & swaps",
  "Activity guidance",
  "Private Ozmo dashboard",
  "Daily meal & water logging",
  "Weight & measurement tracking",
  "Ozmo Score",
  "Scheduled follow-ups",
  "Plan revisions",
  "Direct messaging with your dietitian",
  "Monthly progress report",
  "Secure report storage",
];

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Programmes" }]}
        badge="Six programmes"
        title={<>Programmes built around <span className="hl">real goals</span></>}
        lead="Every programme includes a full consultation, a plan built for your kitchen, your own dashboard, and scheduled follow-ups. What changes is the focus."
        primary={{ href: "/assessment", label: "Not sure which? Take the assessment" }}
        secondary={{ href: "/book", label: "Book a consultation" }}
        chips={["Consultation included", "Plan revisions", "Daily tracking", "Monthly report"]}
      />

      <Section backdrop="grid">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <Link key={p.slug} href={`/programs/${p.slug}`} className="group">
              <Card hover className="flex h-full flex-col">
                <h2 className="text-[23px]">{p.name}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-2)]">{p.oneLiner}</p>
                <dl className="mt-5 grid gap-1.5 text-[14px]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--ink-3)]">Best for</dt>
                    <dd className="text-right font-medium">{p.bestFor}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--ink-3)]">Duration</dt>
                    <dd className="text-right font-medium">{p.duration}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--ink-3)]">Follow-ups</dt>
                    <dd className="text-right font-medium">{p.followUps}</dd>
                  </div>
                </dl>
                <span className="mt-auto inline-flex items-center gap-2 pt-7 text-[15px] font-semibold text-[var(--accent-text)]">
                  Explore <Arrow />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="tint">
        <SectionHeader eyebrow="Side by side" title="Compare programmes" />
        <div className="mt-14 overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--paper)]">
          <table className="w-full min-w-[860px] border-collapse text-[14px]">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 border-b border-[var(--line)] bg-[var(--tint)] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]" />
                {programs.map((p) => (
                  <th
                    key={p.slug}
                    className="border-b border-[var(--line)] bg-[var(--tint)] px-4 py-3 text-left text-[13px] font-bold"
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Best for", (p: (typeof programs)[number]) => p.bestFor],
                ["Duration", (p: (typeof programs)[number]) => p.duration],
                ["Consultation", (p: (typeof programs)[number]) => p.consultation],
                ["Follow-ups", (p: (typeof programs)[number]) => p.followUps],
                ["Messaging", () => "Included"],
                ["Monthly report", () => "Yes"],
              ].map(([label, fn]) => (
                <tr key={label as string}>
                  <th className="sticky left-0 z-10 border-b border-[var(--line-soft)] bg-[var(--paper)] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">
                    {label as string}
                  </th>
                  {programs.map((p) => (
                    <td key={p.slug} className="border-b border-[var(--line-soft)] px-4 py-3 align-top">
                      {(fn as (p: (typeof programs)[number]) => string)(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[13.5px] text-[var(--ink-3)]">
          Pricing is confirmed at consultation — ask us for the current programme fees.
        </p>
      </Section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeader
            eyebrow="Always included"
            title="Included in every programme"
            lead="We don't sell tiers of access. A client on the shortest programme still gets the dietitian's full attention — the difference is how long, and how deep."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {includedInAll.map((i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3.5 text-[15.5px]">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                {i}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="navy" backdrop="grid">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="text-[clamp(34px,5.2vw,58px)]">Not sure which programme fits?</h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-[17px] leading-relaxed text-white/75">
            That&rsquo;s normal — and it&rsquo;s exactly what the assessment is for. Answer a few
            questions and we&rsquo;ll point you to the right starting place. If none of them fit,
            we&rsquo;ll tell you that too.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/assessment" variant="accent">Take the free assessment <Arrow /></Button>
            <Button href="/book" variant="onDark">Book a consultation</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
