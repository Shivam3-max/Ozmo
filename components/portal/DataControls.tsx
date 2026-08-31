"use client";

import { useState } from "react";

export default function DataControls() {
  const [requesting, setRequesting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-3">
      <a
        href="/api/portal/export"
        className="inline-flex min-h-[46px] w-fit items-center rounded-full border border-[var(--line)] bg-[var(--paper)] px-5 text-[14.5px] font-semibold hover:border-[var(--ink)]"
      >
        Download my data
      </a>
      <p className="text-[13px] leading-relaxed text-[var(--ink-3)]">
        A single file with everything we hold — your assessment, plans, logs, measurements,
        appointments and messages.
      </p>

      {done ? (
        <p className="mt-2 rounded-xl bg-[var(--tint)] px-4 py-3 text-[14px] leading-relaxed text-[var(--ink-2)]">
          Your request has been recorded and sent to the clinic. They&rsquo;ll be in touch about what
          happens next, including anything that has to be kept for clinical record-keeping and for
          how long.
        </p>
      ) : (
        <button
          onClick={async () => {
            if (!confirm("Ask Ozmo to delete your data? Someone from the clinic will contact you to confirm.")) return;
            setRequesting(true); setError(null);
            try {
              const res = await fetch("/api/portal/delete-request", { method: "POST" });
              if (!res.ok) setError("Couldn't send that request. Please message the clinic directly.");
              else setDone(true);
            } catch {
              setError("Couldn't reach the server.");
            }
            setRequesting(false);
          }}
          disabled={requesting}
          className="mt-2 inline-flex min-h-[46px] w-fit items-center rounded-full border border-[var(--alert)]/40 px-5 text-[14.5px] font-semibold text-[var(--alert)] hover:bg-[var(--alert)]/8 disabled:opacity-50"
        >
          {requesting ? "Sending…" : "Request deletion of my data"}
        </button>
      )}
      {error && <p role="alert" className="text-[13.5px] text-[var(--alert)]">{error}</p>}
    </div>
  );
}
