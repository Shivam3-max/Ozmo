import Link from "next/link";
import type { ReactNode } from "react";

/** Admin styling is deliberately plainer than the marketing site: dense, quiet, scannable. */

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-[var(--font-display)] text-[28px] font-bold tracking-[-0.02em]">{title}</h1>
        {sub && <p className="mt-1.5 text-[14.5px] text-[var(--ink-2)]">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[var(--line)] bg-[var(--paper)] ${className}`}>{children}</div>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone = "plain",
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "plain" | "good" | "watch" | "alert";
  href?: string;
}) {
  const tones: Record<string, string> = {
    plain: "text-[var(--ink)]",
    good: "text-[var(--good)]",
    watch: "text-[var(--watch)]",
    alert: "text-[var(--alert)]",
  };
  const body = (
    <>
      <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">{label}</p>
      <p className={`tabular mt-2 font-[var(--font-display)] text-[30px] font-bold leading-none ${tones[tone]}`}>
        {value}
      </p>
      {sub && <p className="mt-2 text-[12.5px] text-[var(--ink-3)]">{sub}</p>}
    </>
  );
  return href ? (
    <Link href={href} className="block bg-[var(--paper)] px-5 py-4 transition-colors hover:bg-[var(--tint)]">
      {body}
    </Link>
  ) : (
    <div className="bg-[var(--paper)] px-5 py-4">{body}</div>
  );
}

const STAGE_TONE: Record<string, string> = {
  NEW: "bg-[var(--accent)]/20 text-[var(--accent-text)]",
  CONTACTED: "bg-[var(--tint)] text-[var(--ink-2)]",
  CONSULTATION_BOOKED: "bg-[var(--good)]/12 text-[var(--good)]",
  CONSULTED: "bg-[var(--good)]/12 text-[var(--good)]",
  CONVERTED: "bg-[var(--good)] text-white",
  LOST: "bg-[var(--tint)] text-[var(--ink-3)]",
};

export function StageTag({ stage }: { stage: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] ${
        STAGE_TONE[stage] ?? "bg-[var(--tint)] text-[var(--ink-2)]"
      }`}
    >
      {stage.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

export function Flag({ tone, children }: { tone: "alert" | "watch" | "good"; children: ReactNode }) {
  const tones = {
    alert: "border-[var(--alert)]/30 bg-[var(--alert)]/8 text-[var(--alert)]",
    watch: "border-[var(--watch)]/30 bg-[var(--watch)]/8 text-[var(--watch)]",
    good: "border-[var(--good)]/30 bg-[var(--good)]/8 text-[var(--good)]",
  };
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="font-[var(--font-display)] text-[19px] font-bold">{title}</p>
      <p className="mx-auto mt-2 max-w-[46ch] text-[14.5px] text-[var(--ink-2)]">{body}</p>
    </div>
  );
}

export const th = "border-b border-[var(--line)] bg-[var(--tint)] px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)] whitespace-nowrap";
export const td = "border-b border-[var(--line-soft)] px-4 py-3 align-top text-[14px]";

export function timeAgo(date: Date) {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}
