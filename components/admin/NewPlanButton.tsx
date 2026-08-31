"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewPlanButton({
  clientId,
  templates,
}: {
  clientId: string;
  templates: { id: string; name: string; description: string | null }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        onClick={() => setOpen(true)}
        className="rounded-full bg-[var(--ink)] px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#163B4D]"
      >
        Start a plan
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] p-5">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold">Start from…</p>
        <button onClick={() => setOpen(false)} className="text-[var(--ink-3)]">✕</button>
      </div>
      <p className="mt-1 text-[13.5px] text-[var(--ink-3)]">
        A template copies the whole structure — slots, options, guidelines — so you edit rather than retype.
      </p>

      <div className="mt-4 grid gap-2">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => create(t.id)}
            disabled={busy !== null}
            className="rounded-lg border border-[var(--line)] px-4 py-3 text-left transition-colors hover:border-[var(--ink)] disabled:opacity-50"
          >
            <span className="block text-[14.5px] font-semibold">{t.name}</span>
            {t.description && <span className="mt-0.5 block text-[13px] text-[var(--ink-2)]">{t.description}</span>}
            {busy === t.id && <span className="mt-1 block text-[12.5px] text-[var(--accent-text)]">Creating…</span>}
          </button>
        ))}
        <button
          onClick={() => create()}
          disabled={busy !== null}
          className="rounded-lg border border-dashed border-[var(--line)] px-4 py-3 text-left text-[14.5px] font-semibold text-[var(--ink-2)] hover:border-[var(--ink)] disabled:opacity-50"
        >
          Blank plan {busy === "blank" && <span className="text-[var(--accent-text)]">· creating…</span>}
        </button>
      </div>

      {error && <p role="alert" className="mt-3 text-[13.5px] text-[var(--alert)]">{error}</p>}
    </div>
  );
}
