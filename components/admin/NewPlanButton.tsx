"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function NewPlanButton({
  clientId,
  templates,
}: {
  clientId: string;
  templates: { id: string; name: string; description: string | null }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const matches = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return templates;
    return templates.filter((t) => {
      const hay = `${t.name} ${t.description ?? ""}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [templates, query]);

  const create = async (templateId?: string) => {
    setBusy(templateId ?? "blank");
    setError(null);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, templateId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.planId) {
        setError(data?.error ?? "Couldn't start that plan.");
        setBusy(null);
        return;
      }
      router.push(`/admin/plans/${data.planId}`);
    } catch {
      setError("Couldn't reach the server.");
      setBusy(null);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-[var(--ink)] px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#163B4D]"
      >
        Start a plan
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] p-5 sm:w-[440px]">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold">Start from…</p>
        <button type="button" onClick={() => setOpen(false)} className="text-[var(--ink-3)]" aria-label="Close">✕</button>
      </div>
      <p className="mt-1 text-[13.5px] text-[var(--ink-3)]">
        A template copies the whole structure — slots, options, guidelines — so you edit rather than retype.
      </p>

      {/* Errors sit above the list so they're seen without scrolling past dozens of templates. */}
      {error && <p role="alert" className="mt-3 rounded-lg bg-[var(--alert)]/8 px-3 py-2 text-[13.5px] text-[var(--alert)]">{error}</p>}

      <button
        type="button"
        onClick={() => create()}
        disabled={busy !== null}
        className="mt-4 w-full rounded-lg border border-dashed border-[var(--line)] px-4 py-3 text-left text-[14.5px] font-semibold text-[var(--ink-2)] hover:border-[var(--ink)] disabled:opacity-50"
      >
        Blank plan {busy === "blank" && <span className="text-[var(--accent-text)]">· creating…</span>}
      </button>

      {templates.length > 0 && (
        <>
          <label htmlFor={`template-search-${clientId}`} className="sr-only">Search templates</label>
          <input
            id={`template-search-${clientId}`}
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${templates.length} templates — e.g. diabetes veg 15 days`}
            className="mt-3 min-h-[40px] w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 text-[14px] focus:border-[var(--ink)] focus:outline-none"
          />
          <p aria-live="polite" className="mt-1.5 text-[12px] text-[var(--ink-3)]">
            {query ? `${matches.length} of ${templates.length} templates` : ""}
          </p>
          <div className="mt-1 grid max-h-[360px] gap-2 overflow-y-auto pr-1">
            {matches.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => create(t.id)}
                disabled={busy !== null}
                className="rounded-lg border border-[var(--line)] px-4 py-3 text-left transition-colors hover:border-[var(--ink)] disabled:opacity-50"
              >
                <span className="block text-[14.5px] font-semibold">{t.name}</span>
                {t.description && <span className="mt-0.5 block text-[13px] text-[var(--ink-2)]">{t.description}</span>}
                {busy === t.id && <span className="mt-1 block text-[12.5px] text-[var(--accent-text)]">Creating…</span>}
              </button>
            ))}
            {matches.length === 0 && (
              <p className="px-1 py-3 text-[13.5px] text-[var(--ink-3)]">No template matches “{query}”. Try fewer words, or start blank.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
