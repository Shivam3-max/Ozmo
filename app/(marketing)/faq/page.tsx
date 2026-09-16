import type { Metadata } from "next";
import Link from "next/link";
import { Button, Section, Arrow } from "@/components/ui";
import PageHero from "@/components/PageHero";
import Faq from "@/components/Faq";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Answers about Ozmo's programmes, consultations, diet plans, pricing, the client dashboard, privacy and how our follow-ups work.",
  alternates: { canonical: "/faq" },
};

const groups = [
  {
    title: "Getting started",
    items: [
      { q: "Do I need to know what's wrong with me before I book?", a: "No. Plenty of people arrive knowing only that something feels off. The assessment and the consultation exist precisely to figure that out." },
      { q: "What happens in the first consultation?", a: "A full conversation — health history, reports, medications, routine, food, sleep, what you've tried before. You'll leave knowing the plan of action." },
      { q: "Do I need lab reports to start?", a: "Not required, but helpful. If you have anything from the last six months — CBC, HbA1c, lipid profile, thyroid panel, vitamin D or B12 — bring it. If you don't, your dietitian will tell you whether anything is worth getting done." },
      { q: "Is the health assessment really free?", a: "Yes. No payment, no card, no obligation. You get your Snapshot whether or not you book anything." },
    ],
  },
  {
    title: "Programmes & plans",
    items: [
      { q: "How is an Ozmo plan different from a diet chart?", a: "A diet chart is a document. An Ozmo plan is a document plus alternatives, plus tracking, plus scheduled reviews, plus revisions when it isn't working, plus a dietitian you can message. The document is the smallest part." },
      { q: "Can I follow the plan if my family cooks one meal for everyone?", a: "Yes, and we'd rather you did. Plans that require separate cooking fail within a fortnight. We build around the household meal and adjust your portions, timings and additions." },
      { q: "I'm vegetarian / vegan / Jain / eggetarian. Is that a problem?", a: "Not at all. Tell us in the assessment and the plan is built accordingly." },
      { q: "What if I travel a lot or eat out often?", a: "Then the plan is built for a person who travels and eats out. Both are normal, and both are plannable." },
      { q: "Can I change my plan if I don't like something?", a: "Yes. Message your dietitian. A plan you dislike is a plan you'll abandon, so we'd genuinely rather hear about it." },
      { q: "How often does the plan change?", a: "Typically at each follow-up, and any time something isn't working." },
    ],
  },
  {
    title: "The dashboard",
    items: [
      { q: "Do I need to download an app?", a: "No. Ozmo runs in your browser. On a phone you can add it to your home screen and it behaves like an app, without an app store download." },
      { q: "How long does daily logging take?", a: "Under a minute. Tick off meals, add water, and record your weight once a week." },
      { q: "What if I forget to log?", a: "Nothing breaks — just pick up with your next meal. Your score counts the days you log, not a perfect streak. A missed day is normal; if a fortnight slips by, message your dietitian and adjust the plan together." },
      { q: "Can my dietitian see everything I log?", a: "Yes. That's the point. They see your meals, your water, your weight and your adherence, so follow-ups are based on what actually happened rather than what you remember." },
    ],
  },
  {
    title: "Health & safety",
    items: [
      { q: "Is Ozmo a medical service?", a: "No. Ozmo provides nutrition and lifestyle guidance from a qualified dietitian. We don't diagnose, treat or cure medical conditions, and we don't replace your doctor." },
      { q: "I'm on medication. Can I still join?", a: "Yes, and please tell us exactly what you're taking. We build around your medication and never advise stopping or changing it — that's your doctor's decision." },
      { q: "Will you tell me what my lab report means?", a: "We use your reports to build a better nutrition plan and we'll point out anything that looks worth discussing with your doctor. We won't interpret them as a diagnosis — that isn't a dietitian's job." },
      { q: "Do you prescribe supplements?", a: "Where there's a clear reason, your dietitian may suggest one and explain why. We don't sell supplements, so there's no incentive to recommend anything you don't need." },
      { q: "Is there anyone you can't work with?", a: "Some conditions need a medically supervised diet, and in those cases we'll say so and refer you on. Being told “not us” honestly is better than being sold a programme." },
    ],
  },
  {
    title: "Practical",
    items: [
      { q: "How much does it cost?", a: "Programme fees are confirmed at consultation. Ask us and we'll give you the current rates for each programme and duration." },
      { q: "Can I pause my programme?", a: "For genuine reasons like illness, surgery or extended travel, yes — talk to us and we'll work it out." },
      { q: "What happens when my programme ends?", a: "You keep access to your reports and history. Most people move to a maintenance plan — lighter, cheaper, monthly — because the goal was never to finish, it was to keep it." },
      { q: "Is my health data safe?", a: "Yes. Your data is encrypted, access is restricted to your dietitian and clinic staff who need it, and it is never sold or shared for marketing. You can export or delete your data at any time." },
    ],
  },
];

export default function FaqPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) =>
      g.items.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      }))
    ),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "FAQs" }]}
        badge="Everything people ask"
        title={<>Questions, <span className="hl">answered</span></>}
        lead="If yours isn't here, message us — we'll answer it properly and add it to this page."
        primary={{ href: "/contact", label: "Ask us something" }}
        secondary={{ href: "/assessment", label: "Take the assessment" }}
      />

      <Section backdrop="grid">
        <div className="grid max-w-[90ch] gap-16">
          {groups.map((g, i) => (
            <div key={g.title}>
              <div className="flex items-center gap-4">
                <h2 className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--accent-text)]">
                  {g.title}
                </h2>
                <span className="h-px flex-1 bg-[var(--line)]" aria-hidden />
                <span className="tabular text-[13px] text-[var(--ink-3)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-6">
                <Faq items={g.items} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="navy" backdrop="grid">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="text-[clamp(34px,5.2vw,58px)]">Still have a question?</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/contact" variant="accent">Ask us <Arrow /></Button>
            <Button href="/assessment" variant="onDark">Take the free assessment</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
