import Link from "next/link";
import { Button, Section, Arrow } from "@/components/ui";
import { conditions } from "@/lib/conditions";

export default function NotFound() {
  return (
    <Section backdrop="both">
      <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--accent-text)]">404</p>
      <h1 className="mt-5 text-[clamp(40px,6.4vw,72px)] leading-[0.99]">That page isn&rsquo;t here</h1>
      <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-[var(--ink-2)]">
        It may have moved, or the link might be wrong. Here&rsquo;s where most people are heading.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Button href="/assessment">Take the free assessment <Arrow /></Button>
        <Button href="/programs" variant="outline">See programmes</Button>
        <Button href="/contact" variant="outline">Contact us</Button>
      </div>
      <div className="mt-12">
        <p className="eyebrow">Popular concerns</p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {conditions.slice(0, 6).map((c) => (
            <Link
              key={c.slug}
              href={`/conditions/${c.slug}`}
              className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-5 py-3 text-[15px] font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ink)]"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}
