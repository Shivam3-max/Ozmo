import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import {
  Button, Section, SectionHeader, Card, Badge, Chip, Backdrop, Arrow, Pill,
} from "@/components/ui";
import { programs } from "@/lib/programs";
import { conditions } from "@/lib/conditions";
import Reveal from "@/components/Reveal";
import HeroFrosted from "@/components/HeroFrosted";
import DashboardPreview from "@/components/DashboardPreview";
import Faq from "@/components/Faq";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const goals = [
  ...conditions.map((c) => ({ label: c.name, blurb: c.cardBlurb, href: `/conditions/${c.slug}` })),
  { label: "Fat Loss & Toning", blurb: "Lose fat, keep muscle", href: "/conditions/weight-loss" },
  { label: "Muscle Gain", blurb: "Fuel the training you're already doing", href: "/conditions/sports-nutrition" },
  { label: "General Wellness", blurb: "Feel better, day to day", href: "/programs/lifestyle-wellness" },
];

const steps = [
  { n: "01", title: "Health Assessment", tag: "Free · 4 min", body: "Questions about your body, your routine, your health history and the food you actually eat." },
  { n: "02", title: "Your Health Snapshot", tag: "Instant", body: "A personalised summary — your BMI, your activity level, what stands out, and what to focus on first." },
  { n: "03", title: "Consultation", tag: "Clinic or video", body: "Reports, medications, food preferences, work timings, what you've tried before — all of it, properly." },
  { n: "04", title: "Your Plan", tag: "In your dashboard", body: "Your meals, your portions, your timings, with alternatives for the days the main option isn't possible." },
  { n: "05", title: "Daily Tracking", tag: "Under a minute", body: "Log meals and water in seconds. Your dietitian sees exactly the same picture you do." },
  { n: "06", title: "Follow-Up", tag: "Scheduled", body: "The plan changes as your body does. Every month, a progress report showing what actually moved." },
];

const differentiators = [
  { n: "01", title: "A dietitian, not an algorithm", body: "Your plan is built by a qualified dietitian who has actually spoken to you. Software helps us stay organised and helps you stay consistent — it doesn't decide what you eat." },
  { n: "02", title: "Built for Indian kitchens", body: "Roti, dal, sabzi, poha, idli, rice. Your family cooks one meal, not four. Your plan has to work in that kitchen, on a Tuesday, at 9pm. Ours does." },
  { n: "03", title: "You can see it working", body: "Weight, measurements, adherence, energy — tracked from day one, so progress isn't a feeling, it's a chart." },
  { n: "04", title: "We stay with you", body: "Follow-ups are scheduled, not requested. If you go quiet, we notice. That's the whole point." },
];

const homeFaqs = [
  { q: "Do I have to give up my favourite foods?", a: "No. A plan you can't follow isn't a plan. We work with what you eat and adjust quantities, timings and combinations first. Nothing gets banned outright unless there's a genuine medical reason — and even then, we find you a replacement you'll actually enjoy." },
  { q: "Is this only for weight loss?", a: "No. Weight is one reason people come to us. Blood sugar, PCOS, thyroid, cholesterol, digestion, pregnancy, sports performance and plain everyday wellness are all part of what we do." },
  { q: "Do I need to visit the clinic?", a: "You can consult in person at our clinic or over a video call — whichever suits you. The programme, the plan and your dashboard work exactly the same either way." },
  { q: "Will you replace my doctor?", a: "No, and we won't try. Ozmo provides nutrition and lifestyle guidance. We work alongside your doctor's advice and never ask you to stop or change any medication. If something in your reports needs medical attention, we'll tell you to see your doctor." },
  { q: "What if I fall off the plan?", a: "You will, at some point. Everyone does. That's not failure — it's information. Tell your dietitian what happened and the plan gets adjusted. Being unable to follow a plan usually means the plan needs to change, not you." },
  { q: "How soon will I see results?", a: "That depends on your starting point, your health, your consistency and your body — and anyone who gives you a specific number without meeting you is guessing. What we can promise is that you'll be able to see your progress from week one, because we track it." },
];

// Organisation facts only. Add address, telephone and opening hours here once the
// clinic has confirmed them — search engines treat this as authoritative.
const organisationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${absoluteUrl("/")}#organization`,
      name: "Ozmo Diet Clinic",
      url: absoluteUrl("/"),
      logo: absoluteUrl("/apple-icon"),
      description:
        "Personalised diet and lifestyle programmes built around your body, your kitchen and your reports — with daily tracking, follow-ups and a dietitian who stays with you.",
      areaServed: "IN",
    },
    {
      "@type": "WebSite",
      "@id": `${absoluteUrl("/")}#website`,
      name: "Ozmo Diet Clinic",
      url: absoluteUrl("/"),
      publisher: { "@id": `${absoluteUrl("/")}#organization` },
      inLanguage: "en-IN",
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationSchema).replace(/</g, "\\u003c") }} />
      <HeroFrosted />

      {/* ══════════ PROOF BAR ══════════ */}
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--tint)]">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-2 gap-px px-6 md:grid-cols-4">
          {[
            ["6", "Programmes", "built around real goals"],
            ["10", "Conditions", "with their own approach"],
            ["7", "Steps", "from assessment to plan"],
            ["1", "Dietitian", "who stays with you"],
          ].map(([n, l, s]) => (
            <div key={l} className="py-9 md:py-11">
              <div className="flex items-baseline gap-2.5">
                <span className="tabular font-[var(--font-display)] text-[clamp(34px,4vw,46px)] font-bold leading-none">
                  {n}
                </span>
                <span className="text-[16px] font-semibold">{l}</span>
              </div>
              <p className="mt-1.5 text-[14px] text-[var(--ink-3)]">{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ THE CORE IDEA ══════════ */}
      <section className="relative overflow-hidden bg-[#0F2E3D] py-24 text-white md:py-32">
        <Backdrop variant="grid" dark />
        <div
          className="wash"
          style={{ width: 700, height: 700, right: "-10%", top: "-30%", background: "rgba(247,209,23,0.13)" }}
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-[1200px] px-6">
          <Reveal>
            <div className="mx-auto max-w-[900px] text-center">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-white/20 px-4 py-2 text-[13px] font-medium text-white/75">
                The thing nobody fixes
              </span>
              <h2 className="mt-8 text-[clamp(36px,6.2vw,72px)] leading-[0.98]">
                Most people don&rsquo;t fail the diet.
                <br />
                They fail the{" "}
                <span className="text-[var(--accent)]">follow-up.</span>
              </h2>
              <div className="mx-auto mt-10 grid max-w-[720px] gap-5 text-[clamp(16px,1.6vw,18.5px)] leading-[1.65] text-white/70">
                <p>
                  You&rsquo;ve probably done this before. A plan arrives, you follow it for eleven
                  days, then life happens — a wedding, a deadline, a bad week — and the plan quietly
                  becomes a PDF you never open again.
                </p>
                <p>
                  Ozmo is built around that exact moment. The plan is only the beginning. What matters
                  is what happens in week three, week six, week twelve.
                </p>
              </div>
              <div className="mt-10 inline-flex items-center gap-3 rounded-full bg-white/8 px-6 py-3.5">
                <span className="live-dot h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden />
                <span className="font-[var(--font-display)] text-[clamp(17px,2vw,22px)] font-semibold text-[var(--accent)]">
                  That&rsquo;s the part we do differently.
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ GOALS — BENTO ══════════ */}
      <Section backdrop="grid">
        <Reveal>
          <SectionHeader
            eyebrow="Start with your goal"
            title="What are you working on?"
            lead="Every one of these has a different nutrition approach — and a different plan. Pick what's closest to yours."
          />
        </Reveal>

        <Reveal>
          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* feature tile */}
            <Link
              href="/conditions/weight-loss"
              className="group relative col-span-full overflow-hidden rounded-2xl bg-[#0F2E3D] p-8 text-white transition-all duration-200 hover:-translate-y-1 sm:col-span-2 lg:row-span-2 lg:flex lg:flex-col"
            >
              <Backdrop variant="grid" dark />
              <div className="relative">
                <Pill>Most common</Pill>
                <h3 className="mt-5 text-[clamp(26px,3vw,34px)] leading-[1.05]">Weight loss</h3>
                <p className="mt-4 max-w-[34ch] text-[16px] leading-relaxed text-white/70">
                  Lose fat steadily, without starving — and keep it off after the programme ends.
                </p>
              </div>
              <div className="relative mt-auto pt-10">
                <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--accent)]">
                  Read the approach <Arrow />
                </span>
              </div>
            </Link>

            {goals
              .filter((g) => g.label !== "Weight Loss")
              .map((g) => (
                <Link
                  key={g.label + g.href}
                  href={g.href}
                  className="group rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--ink)]/25 hover:shadow-[0_14px_34px_rgba(15,46,61,0.08)]"
                >
                  <span className="block text-[16.5px] font-semibold leading-snug">{g.label}</span>
                  <span className="mt-1.5 block text-[14px] leading-snug text-[var(--ink-2)]">
                    {g.blurb}
                  </span>
                </Link>
              ))}

            <Link
              href="/assessment"
              className="group rounded-2xl border-2 border-[var(--accent)] bg-[var(--accent)]/10 p-5 transition-all duration-200 hover:-translate-y-1"
            >
              <span className="block text-[16.5px] font-semibold leading-snug">Not sure yet</span>
              <span className="mt-1.5 block text-[14px] leading-snug text-[var(--ink-2)]">
                Take the assessment — we&rsquo;ll help you place it
              </span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--accent-text)]">
                Start free <Arrow />
              </span>
            </Link>
          </div>
        </Reveal>
      </Section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <Section tone="tint">
        <Reveal>
          <SectionHeader
            eyebrow="The process"
            title={<>Six steps.<br />The first one is free.</>}
            lead="From a four-minute questionnaire to a plan that gets revised every fortnight — here's the whole thing."
          />
        </Reveal>

        <Reveal>
          <div className="relative mt-16">
            <div className="absolute left-0 right-0 top-[26px] hidden h-px bg-[var(--line)] lg:block" aria-hidden />
            <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="relative">
                  <div className="flex items-center gap-4">
                    <span className="relative z-10 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper)] font-[var(--font-display)] text-[17px] font-bold">
                      {s.n}
                    </span>
                    <span className="rounded-full bg-[var(--paper)] px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.09em] text-[var(--ink-3)]">
                      {s.tag}
                    </span>
                  </div>
                  <h3 className="mt-5 text-[21px]">{s.title}</h3>
                  <p className="mt-2.5 max-w-[38ch] text-[15.5px] leading-relaxed text-[var(--ink-2)]">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-14">
            <Button href="/how-it-works" variant="outline">
              See the full process <Arrow />
            </Button>
          </div>
        </Reveal>
      </Section>

      {/* ══════════ THE PRODUCT ══════════ */}
      <Section backdrop="washes">
        <div className="grid items-center gap-16 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <SectionHeader
              eyebrow="Your Ozmo dashboard"
              title={<>Everything in one place. <span className="hl">Finally.</span></>}
              lead="Every Ozmo client gets a private dashboard — their plan, their progress, their reports, and a direct line to their dietitian."
            />
            <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-[var(--ink-2)]">
              No more scrolling back through months of chat to find last month&rsquo;s plan. No more
              &ldquo;sir, PDF nahi mil raha.&rdquo;
            </p>
            <ul className="mt-10 grid gap-6">
              {[
                ["Today's plan, ready when you wake up", "Every meal, every timing, with quantities. Tick it off as you go."],
                ["Log a meal in ten seconds", "What you ate, when. Your dietitian sees your adherence in real time."],
                ["Your numbers, tracked properly", "Weight, waist, body fat, water, steps, sleep — charted so you see the trend."],
                ["Your Ozmo Score", "One number for how consistent you've been this week. It goes up when you show up."],
                ["Every report, stored safely", "Plans, consultation notes, progress reports, lab reports. One place, forever."],
                ["Ask your dietitian anything", "A message thread kept alongside your health record — so the answer has context."],
              ].map(([t, b]) => (
                <li key={t} className="flex gap-4">
                  <span
                    className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[#0F2E3D]"
                    aria-hidden
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span>
                    <strong className="block text-[16.5px] font-semibold">{t}</strong>
                    <span className="text-[15.5px] leading-relaxed text-[var(--ink-2)]">{b}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Button href="/assessment">
                Start your free assessment <Arrow />
              </Button>
            </div>
          </Reveal>

          <Reveal>
            <DashboardPreview />
          </Reveal>
        </div>
      </Section>

      {/* ══════════ PROGRAMMES ══════════ */}
      <Section tone="tint">
        <Reveal>
          <SectionHeader
            eyebrow="Programmes"
            title="Built around real goals"
            lead="Every programme includes a full consultation, a personalised plan, dashboard access, tracking and scheduled follow-ups. What changes is the focus — and the depth."
          />
        </Reveal>
        <Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((p, i) => (
              <Link key={p.slug} href={`/programs/${p.slug}`} className="group">
                <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-7 transition-all duration-200 group-hover:-translate-y-1.5 group-hover:border-[var(--ink)]/25 group-hover:shadow-[0_18px_44px_rgba(15,46,61,0.1)]">
                  <span
                    className="absolute left-0 right-0 top-0 h-[3px] origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-300 group-hover:scale-x-100"
                    aria-hidden
                  />
                  <span className="tabular font-[var(--font-display)] text-[13px] font-bold text-[var(--ink-3)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-[23px]">{p.name}</h3>
                  <p className="mt-3 text-[15.5px] leading-relaxed text-[var(--ink-2)]">{p.oneLiner}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[var(--tint)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--ink-2)]">
                      {p.duration}
                    </span>
                    <span className="rounded-full bg-[var(--tint)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--ink-2)]">
                      {p.followUps}
                    </span>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-2 pt-7 text-[15px] font-semibold text-[var(--accent-text)]">
                    Explore <Arrow />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-12">
            <Button href="/programs" variant="outline">
              Compare all programmes <Arrow />
            </Button>
          </div>
        </Reveal>
      </Section>

      {/* ══════════ WHY DIFFERENT ══════════ */}
      <Section backdrop="grid">
        <Reveal>
          <SectionHeader eyebrow="The difference" title="Why this works when the last one didn't" />
        </Reveal>
        <Reveal>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
            {differentiators.map((d) => (
              <div key={d.n} className="relative overflow-hidden bg-[var(--paper)] p-9">
                <span
                  className="pointer-events-none absolute -right-3 -top-8 font-[var(--font-display)] text-[124px] font-bold leading-none text-[var(--ink)] opacity-[0.045]"
                  aria-hidden
                >
                  {d.n}
                </span>
                <h3 className="relative text-[clamp(21px,2.4vw,25px)]">{d.title}</h3>
                <p className="relative mt-4 max-w-[44ch] text-[16px] leading-relaxed text-[var(--ink-2)]">
                  {d.body}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* ══════════ ASSESSMENT ══════════ */}
      <Section tone="tint">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <Badge live>Free · 4 minutes · no payment</Badge>
            <h2 className="mt-7 text-[clamp(34px,5.2vw,58px)] leading-[1.0]">
              Start with your <span className="hl">Health Snapshot</span>
            </h2>
            <div className="mt-7 grid max-w-[52ch] gap-4 text-[17px] leading-relaxed text-[var(--ink-2)]">
              <p>Before you commit to anything, find out where you actually stand.</p>
              <p>
                Answer a few questions about your body, your goals, your health and your routine.
                You&rsquo;ll get an instant Ozmo Health Snapshot — your key numbers, what stands out,
                and a clear view of what to work on first.
              </p>
              <p>It costs nothing, and there&rsquo;s no obligation to book anything afterwards.</p>
            </div>
          </Reveal>

          <Reveal>
            <div className="rounded-[26px] border border-[var(--line)] bg-[var(--paper)] p-8 shadow-[0_22px_56px_rgba(15,46,61,0.09)]">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  Question 1 of 31
                </span>
                <span className="tabular text-[12.5px] text-[var(--ink-3)]">~4 min</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--line-soft)]">
                <div className="h-full w-[3%] rounded-full bg-[var(--accent)]" />
              </div>
              <p className="mt-7 font-[var(--font-display)] text-[clamp(22px,2.6vw,28px)] font-bold leading-tight">
                What would you like to work on first?
              </p>
              <div className="mt-7 grid gap-2.5">
                {[
                  ["Lose weight", "lose-weight"],
                  ["Manage a health condition", "condition"],
                  ["Gain weight", "gain-weight"],
                  ["Build fitness", "fitness"],
                  ["Feel better overall", "wellness"],
                ].map(([label, val]) => (
                  <Link
                    key={val}
                    href={`/assessment?goal=${val}`}
                    className="group flex items-center justify-between rounded-xl border border-[var(--line)] px-5 py-4 text-[16px] font-medium transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--ink)] hover:bg-[var(--accent)]/10"
                  >
                    {label}
                    <Arrow />
                  </Link>
                ))}
              </div>
              <p className="mt-6 text-[13.5px] text-[var(--ink-3)]">
                Pick one to start — you can change it later.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ══════════ FAQ ══════════ */}
      <Section backdrop="grid">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <SectionHeader
              eyebrow="Before you start"
              title="Questions people ask"
              lead="If yours isn't here, ask us — we'll answer it properly."
              action={
                <Button href="/faq" variant="outline" size="md">
                  See all FAQs <Arrow />
                </Button>
              }
            />
          </Reveal>
          <Reveal>
            <Faq items={homeFaqs} />
          </Reveal>
        </div>
      </Section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section className="relative overflow-hidden bg-[#0F2E3D] py-28 text-white md:py-36">
        <Backdrop variant="grid" dark />
        <div
          className="wash"
          style={{ width: 760, height: 760, left: "50%", top: "-40%", transform: "translateX(-50%)", background: "rgba(247,209,23,0.15)" }}
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-[1200px] px-6">
          <Reveal>
            <div className="mx-auto max-w-[760px] text-center">
              <h2 className="text-[clamp(38px,6.4vw,74px)] leading-[0.98]">
                Let&rsquo;s find out where you stand.
              </h2>
              <p className="mx-auto mt-8 max-w-[50ch] text-[clamp(17px,1.7vw,20px)] leading-relaxed text-white/70">
                Four minutes, no payment, no obligation. You&rsquo;ll leave with a clear picture of
                your health and a sensible first step.
              </p>
              <div className="mt-11 flex flex-wrap justify-center gap-3">
                <Button href="/assessment" variant="accent">
                  Start your free assessment <Arrow />
                </Button>
                <Button href="/book" variant="onDark">
                  Book a consultation
                </Button>
              </div>
              <p className="mt-8 text-[14.5px] text-white/50">
                Prefer to talk first?{" "}
                <Link href="/contact" className="text-[var(--accent)] underline underline-offset-4">
                  Get in touch
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
