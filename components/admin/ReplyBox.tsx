"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReplyBox({ threadId, name }: { threadId: string; name: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy || !body.trim()) return;
        setBusy(true); setError(null);
        try {
          const res = await fetch(`/api/admin/messages/${threadId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body }),
          });
          if (!res.ok) {
            const d = await res.json().catch(() => ({}));
            setError(d?.error ?? "Couldn't send.");
            setBusy(false);
            return;
          }
          setBody("");
          router.refresh();
        } catch {
          setError("Couldn't reach the server.");
        }
        setBusy(false);
      }}
    >
      <textarea
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`Reply to ${name}…`}
        className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] p-3 text-[14.5px] leading-relaxed focus:border-[var(--ink)] focus:outline-none"
      />
      {error && <p role="alert" className="mt-2 text-[13px] text-[var(--alert)]">{error}</p>}
      <button
        type="submit"
        disabled={busy || !body.trim()}
        className="mt-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-40"
      >
        {busy ? "Sending…" : "Send reply"}
      </button>
    </form>
  );
}
