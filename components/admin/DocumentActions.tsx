"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DocumentActions({ id, title, visibleToClient }: { id: string; title: string; visibleToClient: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = async (init: RequestInit) => {
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/admin/documents/${id}`, init);
      if (!res.ok) setError((await res.json().catch(() => ({})))?.error ?? "Couldn't update.");
      else router.refresh();
    } catch {
      setError("Couldn't reach the server.");
    }
    setBusy(false);
  };

  const link = "text-[12.5px] font-semibold text-[var(--ink-2)] underline disabled:opacity-50";
  return (
    <span className="flex flex-wrap items-center gap-3">
      <button
        type="button" disabled={busy} className={link}
        onClick={() => call({ method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visibleToClient: !visibleToClient }) })}
      >
        {visibleToClient ? "Hide from client" : "Show to client"}
      </button>
      <button
        type="button" disabled={busy} className={`${link} text-[var(--alert)]`}
        onClick={() => { if (confirm(`Remove "${title}"? The file is deleted from the client's record.`)) void call({ method: "DELETE" }); }}
      >
        Remove
      </button>
      {error && <span role="alert" className="w-full text-[12px] text-[var(--alert)]">{error}</span>}
    </span>
  );
}
