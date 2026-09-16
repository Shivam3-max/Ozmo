"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RunRetention({ total }: { total: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={busy || total === 0}
        onClick={async () => {
          if (!confirm(`Remove ${total} ${total === 1 ? "item" : "items"} now? This can't be undone.`)) return;
          setBusy(true); setMessage(null);
          try {
            const res = await fetch("/api/admin/retention", { method: "POST" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) setMessage(data?.error ?? "Couldn't run the clean-up.");
            else {
              const removed = (data.report as { count: number }[]).reduce((n, r) => n + r.count, 0);
              setMessage(`Done — ${removed} ${removed === 1 ? "item" : "items"} removed. Recorded in the audit log.`);
              router.refresh();
            }
          } catch {
            setMessage("Couldn't reach the server.");
          }
          setBusy(false);
        }}
        className="w-fit rounded-full bg-[var(--ink)] px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-40"
      >
        {busy ? "Cleaning up…" : total === 0 ? "Nothing to remove" : "Run clean-up now"}
      </button>
      {message && <p role="status" className="text-[13.5px] text-[var(--ink-2)]">{message}</p>}
    </div>
  );
}
