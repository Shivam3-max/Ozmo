"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type Msg = { id: string; body: string; createdAt: string; mine: boolean; sender: string };

const QUICK = [
  "Can I eat ",
  "I'm travelling next week — ",
  "I'm finding it hard to ",
  "I have a new report — ",
  "Could we change ",
];

export default function MessageThread({
  threadId,
  messages,
  dietitian,
}: {
  threadId: string;
  messages: Msg[];
  dietitian: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--alert)]/5 px-5 py-3.5">
        <p className="text-[13.5px] leading-relaxed text-[var(--ink-2)]">
          For anything urgent or medical, contact your doctor. This isn&rsquo;t monitored around the
          clock.
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-6 py-8">
            <p className="font-[var(--font-display)] text-[19px] font-bold">Ask {dietitian} anything</p>
            <p className="mt-2 max-w-[48ch] text-[15px] leading-relaxed text-[var(--ink-2)]">
              Stuck on something? Can&rsquo;t find an ingredient? Travelling? Just say so — the plan
              can change.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  m.mine ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-[var(--paper)]"
                }`}
              >
                {!m.mine && (
                  <p className="mb-1 text-[11.5px] font-bold uppercase tracking-[0.08em] text-[var(--accent-text)]">
                    {m.sender}
                  </p>
                )}
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{m.body}</p>
                <p className={`tabular mt-1.5 text-[11.5px] ${m.mine ? "text-white/55" : "text-[var(--ink-3)]"}`}>
                  {new Date(m.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        className="mt-5"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy || !body.trim()) return;
          setBusy(true); setError(null);
          try {
            const res = await fetch("/api/portal/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ body }),
            });
            if (!res.ok) {
              const d = await res.json().catch(() => ({}));
              setError(d?.error ?? "Couldn't send that.");
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
        <div className="mb-2 flex flex-wrap gap-1.5">
          {QUICK.map((q) => (
            <button
              type="button" key={q}
              onClick={() => setBody((b) => (b ? b : q))}
              className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-[12.5px] text-[var(--ink-2)] hover:border-[var(--ink)]"
            >
              {q.trim()}…
            </button>
          ))}
        </div>

        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`Message ${dietitian}…`}
          className="w-full rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 text-[15.5px] leading-relaxed focus:border-[var(--ink)] focus:outline-none"
        />

        {error && <p role="alert" className="mt-2 text-[13.5px] text-[var(--alert)]">{error}</p>}

        <button
          type="submit"
          disabled={busy || !body.trim()}
          className="mt-3 inline-flex min-h-[48px] items-center rounded-full bg-[var(--ink)] px-6 text-[15.5px] font-semibold text-white disabled:opacity-40"
        >
          {busy ? "Sending…" : "Send"}
        </button>
        <p className="mt-2 text-[13px] text-[var(--ink-3)]">
          {dietitian} usually replies within a working day.
        </p>
      </form>
    </>
  );
}
