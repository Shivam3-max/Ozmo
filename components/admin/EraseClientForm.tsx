"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

export default function EraseClientForm({ clientId, clientCode, requestId }: { clientId: string; clientCode: string; requestId?: string }) {
  const router = useRouter();
  const id = useId();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const matches = code.trim().toUpperCase() === clientCode.toUpperCase();

  return (
    <form
      className="grid gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy || !matches) return;
        setBusy(true); setError(null);
        try {
          const res = await fetch(`/api/admin/clients/${clientId}/erase`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmCode: code, requestId }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) { setError(data?.error ?? "Couldn't erase this client."); setBusy(false); return; }
          router.push(requestId ? "/admin/data-requests" : "/admin/clients");
          router.refresh();
        } catch {
          setError("Couldn't reach the server.");
          setBusy(false);
        }
      }}
    >
      <label htmlFor={`${id}-code`} className="text-[14px] text-[var(--ink-2)]">
        Type <strong className="tabular font-semibold text-[var(--ink)]">{clientCode}</strong> to confirm
      </label>
      <input
        id={`${id}-code`} autoComplete="off" spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)}
        className="tabular min-h-[42px] w-full max-w-[260px] rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 text-[14.5px]"
      />
      {error && <p role="alert" className="text-[13.5px] text-[var(--alert)]">{error}</p>}
      <button
        type="submit" disabled={!matches || busy}
        className="w-fit rounded-full bg-[var(--alert)] px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-40"
      >
        {busy ? "Erasing…" : "Erase permanently"}
      </button>
    </form>
  );
}
