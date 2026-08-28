import type { ReactNode } from "react";
import Link from "next/link";
import { Backdrop, Badge, Button, Arrow, Chip } from "@/components/ui";

export default function PageHero({
  badge,
  live = false,
  title,
  lead,
  crumbs,
  chips,
  primary,
  secondary,
  aside,
  note,
}: {
  badge?: string;
  live?: boolean;
  title: ReactNode;
  lead?: ReactNode;
  crumbs?: { label: string; href?: string }[];
  chips?: string[];
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  aside?: ReactNode;
  note?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--line)]">
      <Backdrop variant="both" />
      <div
        className={`relative mx-auto w-full max-w-[1240px] px-6 py-16 md:py-24 ${
          aside ? "grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]" : ""
        }`}
      >
        <div>
          {crumbs && (
            <nav aria-label="Breadcrumb" className="mb-7 flex flex-wrap items-center gap-2 text-[13.5px] text-[var(--ink-3)]">
              {crumbs.map((c, i) => (
                <span key={c.label} className="flex items-center gap-2">
                  {c.href ? (
                    <Link href={c.href} className="transition-colors hover:text-[var(--ink)]">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-[var(--ink-2)]">{c.label}</span>
                  )}
                  {i < crumbs.length - 1 && <span aria-hidden>/</span>}
                </span>
              ))}
            </nav>
          )}

          {badge && <Badge live={live}>{badge}</Badge>}

          <h1
            className={`${badge ? "mt-7" : ""} max-w-[19ch] text-[clamp(40px,6.4vw,72px)] leading-[0.99]`}
          >
            {title}
          </h1>

          {lead && (
            <p className="mt-8 max-w-[56ch] text-[clamp(17px,1.7vw,20px)] leading-[1.55] text-[var(--ink-2)]">
              {lead}
            </p>
          )}

          {(primary || secondary) && (
            <div className="mt-9 flex flex-wrap gap-3">
              {primary && (
                <Button href={primary.href}>
                  {primary.label} <Arrow />
                </Button>
              )}
              {secondary && (
                <Button href={secondary.href} variant="outline">
                  {secondary.label}
                </Button>
              )}
            </div>
          )}

          {chips && chips.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-2.5">
              {chips.map((c) => (
                <Chip key={c}>{c}</Chip>
              ))}
            </div>
          )}

          {note && <p className="mt-6 max-w-[54ch] text-[14.5px] text-[var(--ink-3)]">{note}</p>}
        </div>

        {aside && <div className="lg:pl-4">{aside}</div>}
      </div>
    </section>
  );
}
