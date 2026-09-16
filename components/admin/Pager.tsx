import Link from "next/link";
import { pageHref, type PageInfo } from "@/lib/pagination";

/** "Showing 51–100 of 312 · ← Newer · Older →" under a staff list. */
export default function Pager({
  info,
  base,
  params,
  noun,
}: {
  info: PageInfo;
  base: string;
  params: Record<string, string | undefined>;
  noun: string;
}) {
  if (info.total === 0) return null;
  if (info.page > info.pages) {
    return (
      <nav aria-label={`${noun} pages`} className="mt-4 text-[13.5px] text-[var(--ink-2)]">
        Page {info.page} is past the end of {info.total} {noun}.{" "}
        <Link href={pageHref(base, params, info.pages)} className="font-semibold text-[var(--accent-text)] underline">
          Go to the last page
        </Link>
      </nav>
    );
  }
  const from = (info.page - 1) * info.size + 1;
  const to = Math.min(info.total, info.page * info.size);
  const link = "rounded-full border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2 text-[13px] font-semibold text-[var(--ink-2)] hover:border-[var(--ink)]";

  return (
    <nav aria-label={`${noun} pages`} className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13.5px] text-[var(--ink-2)]">
      <span className="tabular">
        {from}–{to} of {info.total} {noun}
      </span>
      {info.pages > 1 && (
        <span className="flex items-center gap-2">
          {info.page > 1 ? (
            <Link href={pageHref(base, params, info.page - 1)} className={link} rel="prev">← Previous</Link>
          ) : null}
          <span className="tabular px-1">
            Page {info.page} of {info.pages}
          </span>
          {info.page < info.pages ? (
            <Link href={pageHref(base, params, info.page + 1)} className={link} rel="next">Next →</Link>
          ) : null}
        </span>
      )}
    </nav>
  );
}
