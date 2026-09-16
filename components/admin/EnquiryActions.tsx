"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EnquiryActions({ id, handled }: { id: string; handled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true); setError(null);
          try {
            const res = await fetch(`/api/admin/enquiries/${id}`, {
              method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ handled: !handled }),
            });
            if (!res.ok) setError((await res.json().catch(() => ({})))?.error ?? "Couldn't update.");
            else router.refresh();
          } catch {
            setError("Couldn't reach the server.");
          }
          setBusy(false);
        }}
        className={handled
          ? "rounded-full border border-[var(--line)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--ink-2)] hover:border-[var(--ink)] disabled:opacity-50"
          : "rounded-full bg-[var(--ink)] px-3.5 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50"}
      >
        {busy ? "…" : handled ? "Reopen" : "Mark handled"}
      </button>
      {error && <span role="alert" className="text-[12.5px] text-[var(--alert)]">{error}</span>}
    </div>
  );
}
