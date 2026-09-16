import type { Metadata } from "next";
import { Button, Section, SectionHeader, Card, Arrow } from "@/components/ui";
import PageHero from "@/components/PageHero";
import Faq from "@/components/Faq";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "See exactly how an Ozmo programme runs: free health assessment, consultation, a personalised plan, daily tracking, scheduled follow-ups and monthly progress reports.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  {
    n: "01",
    title: "The Health Assessment",
    meta: "Free · about 4 minutes",
    body: [
      "You start online, on your own time. Seven short sections: your basics, your goal, your health background, your lifestyle, what you currently eat, your medical information, and — the one that matters most — what you think is actually getting in your way.",
      "There's no payment and no commitment. Most people finish it in under five minutes.",
    ],
    note: "What you get: an instant Ozmo Health Snapshot — your BMI, your activity profile, your key focus areas and a clear recommended next step.",
  },
  {
    n: "02",
    title: "Your Health Snapshot",
    meta: "Instant",
    body: [
      "A short, personalised summary built from your answers. It tells you where you're starting from and what's worth addressing first.",
      "It's a starting point, not a diagnosis — and we say that clearly on the page.",
    ],
  },
  {
    n: "03",
    title: "The Consultation",
    meta: "In clinic or online",
    body: [
      "Your dietitian goes through everything: your assessment, your reports, your medications, your routine, your food, your history with dieting, and what you can realistically sustain.",
    ],
    note: "Bring: any lab reports from the last six months, a list of medications and supplements, and a rough idea of what you ate yesterday.",
  },
  {
    n: "04",
    title: "Your Personalised Plan",
    meta: "Shortly after your consultation",
    body: [
      "Your plan appears in your Ozmo dashboard. Not a generic chart — your meals, your quantities, your timings, built around what you eat and what your body needs.",
      "Every meal has alternatives, so a missing ingredient or an unexpected dinner out doesn't derail the day. Where it helps, the plan includes a simple activity guide alongside the food.",
    ],
  },
  {
    n: "05",
    title: "Daily Tracking",
    meta: "A few seconds a day",
    body: [
      "Open the dashboard, see today's plan, tick meals off as you eat them. Log your water. Record your weight once a week.",
      "That's the whole daily commitment — under a minute. But it's the difference between a plan you're following and a plan you think you're following, and your dietitian sees exactly the same picture you do.",
    ],
  },
  {
    n: "06",
    title: "Follow-Ups & Adjustment",
    meta: "Scheduled, not optional",
    body: [
      "Your plan changes as your body, your season and your schedule change.",
      "Every month you get a progress report: what moved, what didn't, what we're changing, and what the next month looks like.",
    ],
  },
];

const included = [
  "Full initial consultation",
  "Personalised diet plan",
  "Meal alternatives & swaps",
  "Activity guidance",
  "Private Ozmo dashboard",
  "Daily meal & water logging",
  "Weight & measurement tracking",
  "Ozmo Score & streaks",
  "Scheduled follow-up consultations",
  "Plan revisions",
  "Direct messaging with your dietitian",
  "Monthly progress report",
  "Secure storage of all your reports",
];

const asks = [
  { t: "Honesty", b: "About what you eat, what you drink, what you skip. We can only build around what's real. Nobody here is going to judge you for a Sunday biryani." },
  { t: "A minute a day", b: "Log your meals. It's the single strongest predictor of whether a programme works." },
  { t: "Patience for about three weeks", b: "Bodies adjust slower than motivation fades. The first three weeks are the hardest, and the ones where most people quit." },
  { t: "A message when it isn't working", b: "If the plan is impossible, say so. Impossible plans get rewritten. Silent clients don't get better." },
];

const faqs = [
  { q: "Do I need to know what's wrong with me before I book?", a: "No. Plenty of people arrive knowing only that something feels off. The assessment and the consultation exist precisely to figure that out." },
  { q: "Do I need lab reports to start?", a: "Not required, but helpful. If you have anything from the last six months — CBC, HbA1c, lipid profile, thyroid panel, vitamin D or B12 — bring it. If you don't, your dietitian will tell you whether anything is worth getting done." },
  { q: "Is the health assessment really free?", a: "Yes. No payment, no card, no obligation. You get your Snapshot whether or not you book anything." },
  { q: "How is an Ozmo plan different from a diet chart?", a: "A diet chart is a document. An Ozmo plan is a document plus alternatives, plus tracking, plus scheduled reviews, plus revisions when it isn't working, plus a dietitian you can message. The document is the smallest part." },
  { q: "Do I need to download an app?", a: "No. Ozmo runs in your browser. On a phone you can add it to your home screen and it behaves like an app, without an app store download." },
  { q: "What if I forget to log?", a: "Nothing breaks — just pick up with your next meal. Your score counts the days you log, not a perfect streak. A missed day is normal; if a fortnight slips by, message your dietitian and adjust the plan together." },
  { q: "Can my dietitian see everything I log?", a: "Yes. That's the point. They see your meals, your water, your weight and your adherence, so follow-ups are based on what actually happened rather than what you remember." },
  { q: "What happens when my programme ends?", a: "You keep access to your reports and history. Most people move to a maintenance plan — lighter, cheaper, monthly — because the goal was never to finish, it was to keep it." },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "How it works" }]}
        badge="Six steps · the first is free"
        title={<>How Ozmo <span className="hl">works</span></>}
        lead="Six steps, three months, one dietitian who doesn't disappear after step four."
        primary={{ href: "/assessment", label: "Start with step one" }}
        secondary={{ href: "/book", label: "Book a consultation" }}
        chips={["Free assessment", "Instant snapshot", "Plan in your dashboard", "Scheduled follow-ups"]}
      />

      <Section backdrop="grid">
        <div className="grid gap-16">
          {steps.map((s) => (
            <div key={s.n} className="grid gap-7 border-t border-[var(--line)] pt-9 lg:grid-cols-[280px_1fr] lg:gap-14">
              <div>
                <span className="font-[var(--font-display)] text-[clamp(56px,7vw,78px)] font-bold leading-[0.85] text-[var(--accent)]">
                  {s.n}
                </span>
                <h2 className="mt-5 text-[clamp(24px,2.8vw,30px)]">{s.title}</h2>
                <p className="mt-3 inline-flex rounded-full bg-[var(--tint)] px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">
                  {s.meta}
                </p>
              </div>
              <div className="grid gap-4">
                {s.body.map((b, j) => (
                  <p key={j} className="max-w-[68ch] text-[17px] leading-relaxed text-[var(--ink-2)]">
                    {b}
                  </p>
                ))}
                {s.note && (
                  <p className="max-w-[68ch] rounded-2xl border-l-[3px] border-[var(--accent)] bg-[var(--tint)] px-6 py-5 text-[16px] leading-relaxed text-[var(--ink-2)]">
                    {s.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="tint">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeader eyebrow="Always included" title="What's included in every programme" />
          <div className="grid gap-3 sm:grid-cols-2">
            {included.map((i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3.5 text-[15.5px]">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                {i}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section backdrop="washes">
        <SectionHeader eyebrow="The other half of the deal" title="What we need from you" />
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {asks.map((a) => (
            <Card key={a.t} hover>
              <h3 className="text-[21px]">{a.t}</h3>
              <p className="mt-2.5 text-[15.5px] leading-relaxed text-[var(--ink-2)]">{a.b}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="tint">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader eyebrow="Questions" title="About the process" />
          <Faq items={faqs} />
        </div>
      </Section>

      <Section tone="navy" backdrop="grid">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="text-[clamp(34px,5.2vw,58px)]">Start with step one.</h2>
          <p className="mx-auto mt-7 max-w-[48ch] text-[clamp(17px,1.7vw,19px)] leading-relaxed text-white/70">
            Four minutes, no payment, no obligation.
          </p>
          <div className="mt-10 flex justify-center">
            <Button href="/assessment" variant="accent">Start your free assessment <Arrow /></Button>
          </div>
        </div>
      </Section>
    </>
  );
}
