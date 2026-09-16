"use client";

import Link from "next/link";

/**
 * Shared fallback for route error boundaries. Shows the reference that matches
 * the server log line (digest) — never the error message, which in production
 * is either generic or could contain someone's data.
 */
export default function ErrorPanel({
  digest,
  retry,
  home,
  homeLabel,
}: {
  digest?: string;
  retry: () => void;
  home: string;
  homeLabel: string;
}) {
  return (
    <div role="alert" className="mx-auto max-w-[560px] px-6 py-16">
      <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--alert)]">Something went wrong</p>
      <h1 className="mt-4 font-[var(--font-display)] text-[clamp(28px,4vw,38px)] font-bold leading-tight tracking-[-0.02em]">
        This page didn&rsquo;t load
      </h1>
      <p className="mt-4 text-[16px] leading-relaxed text-[var(--ink-2)]">
        Anything you&rsquo;d already saved is safe. Try again — if it keeps happening, tell the clinic and quote the
        reference below.
      </p>
      {digest && (
        <p className="mt-4 text-[14px] text-[var(--ink-2)]">
          Reference <code className="rounded bg-[var(--tint)] px-1.5 py-0.5 font-mono text-[13px]">{digest}</code>
        </p>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => retry()}
          className="inline-flex min-h-[46px] items-center rounded-full bg-[var(--ink)] px-6 text-[15px] font-semibold text-white"
        >
          Try again
        </button>
        <Link
          href={home}
          className="inline-flex min-h-[46px] items-center rounded-full border border-[var(--line)] px-6 text-[15px] font-semibold text-[var(--ink)] hover:border-[var(--ink)]"
        >
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
