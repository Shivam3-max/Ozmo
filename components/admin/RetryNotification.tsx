"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const OUTCOME: Record<string, string> = {
  SENT: "Sent.",
  FAILED: "Still couldn't send — check the email settings.",
  SKIPPED: "Email sending still isn't set up.",
};

export default function RetryNotification({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="grid justify-items-start gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true); setMessage(null);
          try {
            const res = await fetch(`/api/admin/notifications/${id}/retry`, { method: "POST" });
            const data = await res.json().catch(() => ({}));
            setMessage(res.ok ? OUTCOME[data.status] ?? "Tried again." : data?.error ?? "Couldn't retry.");
            if (res.ok) router.refresh();
          } catch {
            setMessage("Couldn't reach the server.");
          }
          setBusy(false);
        }}
        className="rounded-full border border-[var(--line)] px-3 py-1.5 text-[12.5px] font-semibold hover:border-[var(--ink)] disabled:opacity-50"
      >
        {busy ? "Sending…" : "Try again"}
      </button>
      {message && <span role="status" className="text-[12px] text-[var(--ink-2)]">{message}</span>}
    </div>
  );
}
