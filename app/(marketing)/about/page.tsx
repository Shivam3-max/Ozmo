import type { Metadata } from "next";
import { Button, Section, SectionHeader, Card, Arrow } from "@/components/ui";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "About the Clinic",
  description:
    "Ozmo Diet Clinic builds personalised nutrition programmes around your body, your health and your kitchen — with tracking, follow-ups and a dietitian who stays involved.",
  alternates: { canonical: "/about" },
};

const beliefs = [
  { n: "01", t: "Food is not the enemy", b: "No food is banned by default. Rice isn't the problem. Roti isn't the problem. Quantity, timing, combination and consistency are almost always the problem — and those are fixable without making your dinner table miserable." },
  { n: "02", t: "The plan must fit your kitchen", b: "If your mother cooks one meal for five people, your plan has to work inside that meal. If you eat out four times a week, your plan has to account for it. We build around your life, not around an ideal version of it." },
  { n: "03", t: "What gets measured, changes", b: "Weight, waist, energy, adherence — we track from day one. Not to judge you, but because progress you can see is progress you keep going for. And because a plan that isn't working should be identifiable in week two, not month three." },
  { n: "04", t: "Nutrition supports medicine; it doesn't replace it", b: "We work alongside your doctor. We read your reports to understand you better, not to diagnose you. We will never tell you to stop a medication, and we'll tell you plainly when something needs a doctor rather than a dietitian." },
  { n: "05", t: "Consistency beats intensity", b: "A plan you follow 80% of the time for six months will beat a perfect plan you follow completely for eleven days. Everything we've built — the tracking, the check-ins, the score — exists to protect that 80%." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        badge="About Ozmo"
        title={<>We&rsquo;re not here to give you a <span className="hl">diet chart.</span></>}
        lead="We're here to change how you eat — and then to stay with you long enough for it to hold."
        primary={{ href: "/assessment", label: "Take the free assessment" }}
        secondary={{ href: "/how-it-works", label: "See how it works" }}
      />

      <Section backdrop="grid">
        <SectionHeader
          eyebrow="Why we exist"
          title="The problem with how nutrition is usually delivered"
        />
        <div className="mt-10 grid max-w-[68ch] gap-5 text-[17.5px] leading-relaxed text-[var(--ink-2)]">
          <p>
            Most people who come to us have had a diet plan before. Sometimes three or four. They can
            describe them in detail: the boiled vegetables, the &ldquo;no rice&rdquo; rule, the green
            tea, the two weeks of enthusiasm.
          </p>
          <p>
            What they can&rsquo;t describe is what happened next — because nothing did. The plan
            ended. Nobody called. The weight came back, and with it the quiet conclusion that{" "}
            <em>this doesn&rsquo;t work for me.</em>
          </p>
          <p>
            It isn&rsquo;t that they lacked discipline. It&rsquo;s that they were handed a document
            and left alone with it.
          </p>
          <p>
            Nutrition isn&rsquo;t a document. It&rsquo;s a set of decisions you make three to five
            times a day, every day, for months — under real conditions, with real food, in a real
            kitchen, alongside a job and a family and a wedding season. A plan that doesn&rsquo;t
            survive those conditions was never a plan.
          </p>
        </div>
        <p className="mt-14 max-w-[26ch] border-l-[3px] border-[var(--accent)] pl-8 font-[var(--font-display)] text-[clamp(26px,4vw,40px)] font-bold leading-[1.08]">
          Ozmo was built around the part everyone else skips: what happens after the plan.
        </p>
      </Section>

      <Section tone="tint">
        <SectionHeader eyebrow="Five principles" title="What we believe" />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {beliefs.map((b) => (
            <Card key={b.n} hover className="relative overflow-hidden">
              <span
                className="pointer-events-none absolute -right-1 -top-5 font-[var(--font-display)] text-[76px] font-bold leading-none text-[var(--ink)] opacity-[0.05]"
                aria-hidden
              >
                {b.n}
              </span>
              <h3 className="relative text-[19px]">{b.t}</h3>
              <p className="relative mt-2.5 text-[15px] leading-relaxed text-[var(--ink-2)]">{b.b}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="Where we work" title="The clinic" />
            <p className="mt-7 max-w-[52ch] text-[17px] leading-relaxed text-[var(--ink-2)]">
              Ozmo Diet Clinic runs both in-clinic and online consultations, so the programme works
              whether you can come in or not. The plan, the dashboard and the follow-ups are the same
              either way.
            </p>
            <div className="mt-7 rounded-xl border-l-[3px] border-[var(--accent)] bg-[var(--tint)] px-5 py-4">
              <p className="text-[14.5px] leading-relaxed text-[var(--ink-2)]">
                Clinic visits are confirmed appointment-by-appointment so clients receive current directions, access notes and preparation instructions.
              </p>
            </div>
            <div className="mt-8">
              <Button href="/contact" variant="outline">Get in touch →</Button>
            </div>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--tint)]">
            <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label="Clinic consultation illustration">
              <rect width="400" height="300" fill="#F2F6F7" />
              <rect x="40" y="90" width="150" height="170" rx="6" fill="#0F2E3D" opacity="0.08" />
              <rect x="210" y="140" width="150" height="120" rx="6" fill="#0F2E3D" opacity="0.08" />
              <circle cx="300" cy="80" r="34" fill="#F7D117" opacity="0.6" />
            </svg>
          </div>
        </div>
      </Section>

      <Section tone="navy" backdrop="grid">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="text-[clamp(34px,5.2vw,58px)]">Start where everyone starts.</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/assessment" variant="accent">Take the free assessment <Arrow /></Button>
            <Button href="/book" variant="onDark">Book a consultation</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
