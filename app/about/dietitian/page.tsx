import type { Metadata } from "next";
import Link from "next/link";
import { Button, Section, SectionHeader, Card, Arrow, Badge } from "@/components/ui";
import { conditions } from "@/lib/conditions";

export const metadata: Metadata = {
  title: "Meet Your Dietitian",
  description:
    "Meet the dietitian behind Ozmo — a practical approach to nutrition built for Indian kitchens, with consultations that go far beyond a diet chart.",
  alternates: { canonical: "/about/dietitian" },
};

export default function DietitianPage() {
  return (
    <>
      <Section className="border-b border-[var(--line)]" backdrop="both">
        <div className="grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--tint)]">
            <svg viewBox="0 0 320 400" className="h-full w-full" role="img" aria-label="Portrait placeholder">
              <rect width="320" height="400" fill="#F2F6F7" />
              <circle cx="160" cy="150" r="62" fill="#0F2E3D" opacity="0.1" />
              <path d="M52 400c0-62 48-108 108-108s108 46 108 108z" fill="#0F2E3D" opacity="0.1" />
              <rect x="0" y="376" width="320" height="24" fill="#F7D117" opacity="0.5" />
            </svg>
          </div>
          <div>
            <Badge>Your dietitian</Badge>
            <h1 className="mt-7 text-[clamp(38px,5.6vw,64px)] leading-[0.99]">
              The person behind your plan
            </h1>
            <p className="mt-8 max-w-[54ch] text-[clamp(17px,1.7vw,20px)] leading-[1.55] text-[var(--ink-2)]">
              Every Ozmo plan is written by a qualified dietitian who has sat down with you, read
              your reports, and asked about the parts of your life that don&rsquo;t sound like
              nutrition.
            </p>
            <div className="mt-9 rounded-2xl border-l-[3px] border-[var(--watch)] bg-[var(--tint)] px-6 py-5">
              <p className="text-[14.5px] leading-relaxed text-[var(--ink-2)]">
                <strong className="text-[var(--ink)]">Profile in preparation.</strong> Full name,
                qualifications, registration details and years of practice are being verified before
                publication. We don&rsquo;t publish credentials we haven&rsquo;t confirmed.
              </p>
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/book">Book a consultation <Arrow /></Button>
              <Button href="/assessment" variant="outline">Take the free assessment</Button>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="tint">
        <SectionHeader eyebrow="Specialisms" title="Areas of focus" />
        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {conditions.slice(0, 6).map((c) => (
            <Link
              key={c.slug}
              href={`/conditions/${c.slug}`}
              className="group rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--ink)]/25 hover:shadow-[0_16px_38px_rgba(15,46,61,0.09)]"
            >
              <span className="block text-[18px] font-semibold">
                {c.name}
              </span>
              <span className="mt-1.5 block text-[14.5px] leading-snug text-[var(--ink-2)]">
                {c.cardBlurb}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeader eyebrow="The first meeting" title="How consultations work" />
          <div className="grid gap-5 text-[17.5px] leading-relaxed text-[var(--ink-2)]">
            <p>
              The first consultation is a proper conversation, not a form-filling exercise.
              We&rsquo;ll go through your health history, any reports you have, your medications,
              your typical day, what you eat and when, what you&rsquo;ve tried before and what went
              wrong with it.
            </p>
            <p>
              I&rsquo;ll ask about things that don&rsquo;t sound like nutrition — your sleep, your
              work hours, who cooks at home, how often you eat out, how much you travel. Those
              details decide whether a plan survives contact with your actual life.
            </p>
            <p>
              You&rsquo;ll leave the consultation knowing what we&rsquo;re going to do and why. Your
              plan reaches your Ozmo dashboard shortly afterwards.
            </p>
          </div>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            ["Bring your reports", "Anything from the last six months — CBC, HbA1c, lipid profile, thyroid, vitamin D or B12."],
            ["Bring your medication list", "Names and timings. We build around them and never advise changing them."],
            ["Bring yesterday", "A rough idea of what you actually ate. Not your best day — a normal one."],
          ].map(([t, b]) => (
            <Card key={t} hover>
              <h3 className="text-[20px]">{t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-2)]">{b}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="navy" backdrop="grid">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="text-[clamp(34px,5.2vw,58px)]">Book a consultation</h2>
          <p className="mx-auto mt-7 max-w-[48ch] text-[clamp(17px,1.7vw,19px)] leading-relaxed text-white/70">
            In the clinic or over video — whichever suits you.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/book" variant="accent">Book now <Arrow /></Button>
            <Button href="/assessment" variant="onDark">Do the assessment first</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
