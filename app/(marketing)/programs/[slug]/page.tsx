import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Section, SectionHeader, Card, MedicalNotice, Arrow, Pill } from "@/components/ui";
import PageHero from "@/components/PageHero";
import Faq from "@/components/Faq";
import { programs, getProgram } from "@/lib/programs";

export function generateStaticParams() {
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProgram(slug);
  if (!p) return {};
  return {
    title: { absolute: p.metaTitle },
    description: p.metaDescription,
    alternates: { canonical: `/programs/${p.slug}` },
  };
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProgram(slug);
  if (!p) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: p.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Programmes", href: "/programs" },
          { label: p.name },
        ]}
        badge="Programme"
        title={p.h1}
        lead={p.sub}
        chips={[p.duration, `${p.consultation} consultation`, `${p.followUps} follow-ups`]}
        primary={{ href: "/assessment", label: "Start with the free assessment" }}
        secondary={{ href: "/book", label: "Book a consultation" }}
        aside={
          <div className="grid gap-4">
            {p.disclaimerBanner && <MedicalNotice />}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-7 shadow-[0_18px_44px_rgba(15,46,61,0.08)]">
              <p className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
                Included in this programme
              </p>
              <ul className="mt-5 grid gap-3">
                {[
                  "Full initial consultation",
                  "Personalised plan with alternatives",
                  "Private Ozmo dashboard",
                  "Daily meal & water logging",
                  `${p.followUps} follow-up consultations`,
                  "Direct messaging with your dietitian",
                  "Monthly progress report",
                ].map((i) => (
                  <li key={i} className="flex gap-3 text-[15.5px]">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[#0F2E3D]"
                      aria-hidden
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        }
      />

      {/* who it's for / not for */}
      <Section tone="tint">
        <SectionHeader eyebrow="Fit check" title="Is this the right programme for you?" />
        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <Card>
            <Pill tone="good">A good fit</Pill>
            <h3 className="mt-4 text-[24px]">Who this is for</h3>
            <ul className="mt-5 grid gap-3">
              {p.forYou.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[15.5px] leading-relaxed">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <Pill tone="watch">Not a fit</Pill>
            <h3 className="mt-4 text-[24px]">Who this is not for</h3>
            <p className="mt-2.5 text-[14.5px] text-[var(--ink-3)]">
              We&rsquo;d rather tell you now than take your money.
            </p>
            <ul className="mt-5 grid gap-3">
              {p.notForYou.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[15.5px] leading-relaxed text-[var(--ink-2)]">
                  <span className="mt-2 h-px w-3 shrink-0 bg-[var(--ink-3)]" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* approach */}
      <Section backdrop="washes">
        <SectionHeader eyebrow="Method" title="Our approach" />
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
          {p.approach.map((a, i) => (
            <div key={a.title} className="relative overflow-hidden bg-[var(--paper)] p-9">
              <span
                className="pointer-events-none absolute -right-3 -top-8 font-[var(--font-display)] text-[112px] font-bold leading-none text-[var(--ink)] opacity-[0.045]"
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="relative text-[21px]">{a.title}</h3>
              <p className="relative mt-3.5 max-w-[44ch] text-[16px] leading-relaxed text-[var(--ink-2)]">{a.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* months */}
      {p.months && (
        <Section tone="tint">
          <SectionHeader eyebrow="Month by month" title="How the three months run" />
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {p.months.map((m, i) => (
              <Card key={m.label} hover>
                <span className="font-[var(--font-display)] text-[13px] font-bold tracking-[0.06em] text-[var(--accent-text)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-[19px]">{m.label}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--ink-2)]">{m.body}</p>
              </Card>
            ))}
          </div>
          <p className="mt-6 max-w-[70ch] text-[14.5px] text-[var(--ink-3)]">
            The six-month version continues from here — deeper work, more habit independence, and a
            full maintenance handover at the end.
          </p>
        </Section>
      )}

      {/* tracked */}
      <Section>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeader
            eyebrow="Measured"
            title="What we track"
            lead="All of it lands in your dashboard, and your dietitian sees the same picture you do."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {p.tracks.map((t) => (
              <div key={t} className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3.5 text-[15.5px]">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                {t}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* sample day */}
      {p.sampleDay && (
        <Section tone="tint">
          <SectionHeader
            eyebrow="In practice"
            title="A typical day"
            lead="An example only. Your plan will be built around your routine, your preferences and your health."
          />
          <div className="mt-12 max-w-[820px] overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--paper)]">
            <table className="w-full min-w-[520px] border-collapse text-[15px]">
              <tbody>
                {p.sampleDay.map((d) => (
                  <tr key={d.time} className="border-b border-[var(--line-soft)] last:border-0">
                    <td className="tabular w-[120px] px-5 py-3.5 align-top text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">
                      {d.time}
                    </td>
                    <td className="px-5 py-3.5">{d.meal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* faqs */}
      <Section backdrop="grid">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader eyebrow="Questions" title="About this programme" />
          <Faq items={p.faqs} />
        </div>
      </Section>

      {/* related */}
      <Section tone="tint" className="!py-14">
        <h2 className="text-[22px]">Related concerns</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {p.related.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-5 py-3 text-[15px] font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ink)]"
            >
              {r.label} →
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="navy" backdrop="grid">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="text-[clamp(34px,5.2vw,58px)]">Start where everyone starts.</h2>
          <p className="mx-auto mt-7 max-w-[50ch] text-[clamp(17px,1.7vw,19px)] leading-relaxed text-white/70">
            Four minutes, no payment, no obligation. You&rsquo;ll get a personalised snapshot and a
            clear first step.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/assessment" variant="accent">Take the free assessment <Arrow /></Button>
            <Button href="/book" variant="onDark">Book a consultation</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
