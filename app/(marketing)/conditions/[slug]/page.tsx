import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Section, SectionHeader, Card, MedicalNotice, Arrow, Pill } from "@/components/ui";
import PageHero from "@/components/PageHero";
import Faq from "@/components/Faq";
import { conditions, getCondition } from "@/lib/conditions";
import { getProgram } from "@/lib/programs";

export function generateStaticParams() {
  return conditions.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCondition(slug);
  if (!c) return {};
  return {
    title: { absolute: c.metaTitle.includes("Ozmo") ? c.metaTitle : `${c.metaTitle} | Ozmo Diet Clinic` },
    description: c.metaDescription,
    alternates: { canonical: `/conditions/${c.slug}` },
  };
}

/** Renders **bold** spans inside a paragraph without pulling in a markdown dep. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-[var(--ink)]">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default async function ConditionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCondition(slug);
  if (!c) notFound();
  const program = getProgram(c.programSlug);

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <PageHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Conditions", href: "/conditions" },
          { label: c.name },
        ]}
        badge={c.group}
        title={c.h1}
        lead={c.sub}
        primary={{ href: "/assessment", label: "Take the free assessment" }}
        secondary={{ href: "/book", label: "Book a consultation" }}
        aside={
          <div className="grid gap-4">
            <MedicalNotice />
            {c.highCaution && c.doctorFirst && (
              <div className="rounded-2xl border border-[var(--alert)]/25 bg-[var(--alert)]/6 px-6 py-5">
                <p className="text-[15px] leading-relaxed text-[var(--ink-2)]">{c.doctorFirst}</p>
              </div>
            )}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-6 py-5">
              <p className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
                Recommended programme
              </p>
              <p className="mt-2.5 font-[var(--font-display)] text-[22px] font-bold">
                {c.programLabel}
              </p>
              <Link
                href={`/programs/${c.programSlug}`}
                className="group mt-3 inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--accent-text)]"
              >
                See what&rsquo;s included <Arrow />
              </Link>
            </div>
          </div>
        }
      />

      {/* is this you */}
      <Section tone="tint">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeader eyebrow="Recognise any of this?" title="Is this you?" />
            {c.isThisYouNote && (
              <p className="mt-7 max-w-[40ch] rounded-2xl border-l-[3px] border-[var(--accent)] bg-[var(--paper)] px-6 py-5 text-[16px] leading-relaxed text-[var(--ink-2)]">
                {c.isThisYouNote}
              </p>
            )}
          </div>
          <ul className="grid gap-3">
            {c.isThisYou.map((i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-3.5 text-[15.5px] leading-relaxed"
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                {i}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* why */}
      <Section backdrop="grid">
        <SectionHeader eyebrow="The mechanism" title={c.why.heading} />
        <div className="mt-9 grid max-w-[68ch] gap-5">
          {c.why.paras.map((p, i) => (
            <p key={i} className="text-[17px] leading-relaxed text-[var(--ink-2)]">
              <Rich text={p} />
            </p>
          ))}
        </div>
      </Section>

      {/* how nutrition helps */}
      <Section tone="tint">
        <SectionHeader eyebrow="How nutrition helps" title={c.helps.heading} lead={c.helps.intro} />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {c.helps.points.map((pt, i) => (
            <Card key={pt.title} hover>
              <span className="tabular font-[var(--font-display)] text-[13px] font-bold text-[var(--accent-text)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-[18px]">{pt.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-2)]">{pt.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* what ozmo does */}
      <Section backdrop="washes">
        <SectionHeader eyebrow="Our approach" title="What Ozmo does about it" />
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
          {c.ozmo.map((o, i) => (
            <div key={o.title} className="relative overflow-hidden bg-[var(--paper)] p-9">
              <span
                className="pointer-events-none absolute -right-3 -top-8 font-[var(--font-display)] text-[112px] font-bold leading-none text-[var(--ink)] opacity-[0.045]"
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="relative text-[21px]">{o.title}</h3>
              <p className="relative mt-3.5 max-w-[44ch] text-[16px] leading-relaxed text-[var(--ink-2)]">
                {o.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* foods */}
      {(c.foodsHelp || c.foodsLimit) && (
        <Section tone="tint">
          <SectionHeader eyebrow="On the plate" title="What usually helps, and what usually doesn't" />
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {c.foodsHelp && (
              <Card>
                <Pill tone="good">Usually helps</Pill>
                <h3 className="mt-4 text-[23px]">Foods that usually help</h3>
                <ul className="mt-5 grid gap-2">
                  {c.foodsHelp.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[15.5px]">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--good)]" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {c.foodsLimit && (
              <Card>
                <Pill tone="watch">Worth limiting</Pill>
                <h3 className="mt-4 text-[23px]">Foods usually worth limiting</h3>
                <ul className="mt-5 grid gap-2">
                  {c.foodsLimit.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[15.5px] text-[var(--ink-2)]">
                      <span className="mt-2 h-px w-3 shrink-0 bg-[var(--ink-3)]" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
          {c.foodsNote && (
            <p className="mt-6 max-w-[74ch] rounded-lg border-l-[3px] border-[var(--accent)] bg-[var(--paper)] px-5 py-4 text-[15.5px] leading-relaxed text-[var(--ink-2)]">
              {c.foodsNote}
            </p>
          )}
        </Section>
      )}

      {/* sample day */}
      {c.sampleDay && (
        <Section backdrop="grid">
          <SectionHeader
            eyebrow="In practice"
            title="A sample day"
            lead="An example only. Yours will be built around your food, your routine and your health."
          />
          <div className="mt-12 max-w-[820px] overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--paper)]">
            <table className="w-full min-w-[520px] border-collapse text-[15px]">
              <tbody>
                {c.sampleDay.map((d) => (
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

      {/* journey */}
      {c.journey && (
        <Section tone="tint">
          <SectionHeader eyebrow="Timeline" title="What the journey usually looks like" />
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {c.journey.map((j, i) => (
              <Card key={j.label} hover>
                <span className="tabular font-[var(--font-display)] text-[13px] font-bold text-[var(--accent-text)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-[19px]">{j.label}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-2)]">{j.body}</p>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* myths */}
      {c.myths.length > 0 && (
        <Section backdrop="washes">
          <SectionHeader eyebrow="Setting it straight" title="Common myths" />
          <div className="mt-14 max-w-[92ch] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)] divide-y divide-[var(--line)]">
            {c.myths.map((m) => (
              <div key={m.myth} className="grid gap-3 px-7 py-7 md:grid-cols-[0.85fr_1.15fr] md:gap-10">
                <p className="text-[17px] font-semibold leading-snug text-[var(--ink-3)] line-through decoration-[var(--alert)]/50 decoration-2">
                  &ldquo;{m.myth}&rdquo;
                </p>
                <p className="text-[16.5px] leading-relaxed">{m.truth}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* faqs */}
      <Section tone="tint">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader eyebrow="Questions" title="Frequently asked" />
          <Faq items={c.faqs} />
        </div>
      </Section>

      {/* when to see a doctor */}
      {c.doctorFirst && !c.highCaution && (
        <Section>
          <div className="max-w-[86ch] rounded-2xl border border-[var(--alert)]/25 bg-[var(--alert)]/6 px-8 py-8">
            <Pill tone="alert">Important</Pill>
            <h2 className="mt-4 text-[clamp(24px,3vw,30px)]">When to see a doctor first</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-[var(--ink-2)]">{c.doctorFirst}</p>
          </div>
        </Section>
      )}

      {/* programme CTA */}
      <Section tone="navy" backdrop="grid">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
              Recommended programme
            </p>
            <h2 className="mt-5 text-[clamp(32px,4.6vw,52px)]">{c.programLabel}</h2>
            {program && (
              <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-white/75">
                {program.sub}
              </p>
            )}
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href={`/programs/${c.programSlug}`} variant="accent">
                Explore the programme <Arrow />
              </Button>
              <Button href="/assessment" variant="onDark">Take the free assessment</Button>
            </div>
          </div>
          <div>
            <p className="eyebrow !text-white/45">Related concerns</p>
            <ul className="mt-4 grid gap-2">
              {c.related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="text-[16px] text-white/85 hover:text-[var(--accent)]">
                    {r.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
