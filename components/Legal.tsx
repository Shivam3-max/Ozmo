import type { ReactNode } from "react";
import { Section } from "@/components/ui";
import PageHero from "@/components/PageHero";

export function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: title }]}
        badge={eyebrow}
        title={title}
        lead={intro}
      />
      <Section backdrop="grid">
        <div className="grid max-w-[72ch] gap-10">{children}</div>
      </Section>
    </>
  );
}

export function Clause({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-[clamp(21px,2.4vw,25px)]">{heading}</h2>
      <div className="mt-4 grid gap-3.5 text-[17px] leading-relaxed text-[var(--ink-2)]">{children}</div>
    </section>
  );
}

export function Draft() {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--tint)] px-6 py-5">
      <p className="text-[15px] leading-relaxed text-[var(--ink-2)]">
        <strong className="text-[var(--ink)]">Internal legal review note.</strong> Confirm clinic
        entity details, retention periods and grievance contacts before public launch.
      </p>
    </div>
  );
}
