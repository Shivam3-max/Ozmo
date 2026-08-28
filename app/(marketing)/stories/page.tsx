import type { Metadata } from "next";
import { Button, Section, Arrow } from "@/components/ui";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Client Journeys",
  description:
    "Real client journeys from Ozmo Diet Clinic, shared with permission. See what changed, how long it took, and what made the difference.",
  alternates: { canonical: "/stories" },
};

export default function StoriesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Journeys" }]}
        badge="Shared with permission"
        title={<>Real <span className="hl">journeys</span></>}
        lead="Real numbers, real timelines, shared with written consent. Results vary from person to person — the approach doesn't."
      />

      <Section backdrop="grid">
        <div className="max-w-[700px] rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-9">
          <h2 className="text-[clamp(24px,3vw,30px)]">Stories coming soon</h2>
          <p className="mt-4 text-[16.5px] leading-relaxed text-[var(--ink-2)]">
            We&rsquo;re collecting journeys from clients who&rsquo;ve agreed to share them — with real
            numbers, not stock quotes. We won&rsquo;t publish anyone&rsquo;s story, photo or figures
            without their written consent, so this page stays empty until we have it.
          </p>
          <p className="mt-4 text-[16.5px] leading-relaxed text-[var(--ink-2)]">
            In the meantime, the fastest way to understand how we work is to try it.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="/assessment">Take the free assessment <Arrow /></Button>
            <Button href="/how-it-works" variant="outline">See how it works</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
