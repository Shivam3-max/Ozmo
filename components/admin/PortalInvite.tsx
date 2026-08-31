"use client";

import { useState } from "react";

export default function PortalInvite({ clientId, email }: { clientId: string; email: string }) {
  const [link, setLink] = useState<string | null>(null);
  const [days, setDays] = useState(14);
  const [hadPassword, setHadPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const placeholder = email.endsWith("@no-email.ozmo.local");

  return (
    <div className="grid gap-3">
      {link ? (
        <>
          <p className="text-[13.5px] leading-relaxed text-[var(--ink-2)]">
            {hadPassword
              ? "This resets their password. The old one stops working once they use the link."
              : "Send this link to the client. They set their own password and the link then stops working."}
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className="min-h-[38px] flex-1 rounded-lg border border-[var(--line)] bg-[var(--tint)] px-3 text-[12.5px]"
            />
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(link);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  setError("Couldn't copy — select the link and copy it manually.");
                }
              }}
              className="shrink-0 rounded-full bg-[var(--ink)] px-4 py-2 text-[13px] font-semibold text-white"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-[12.5px] text-[var(--ink-3)]">Valid for {days} days.</p>
        </>
      ) : (
        <>
          <p className="text-[13.5px] leading-relaxed text-[var(--ink-2)]">
            Generate a link the client uses once to set their own password and open their dashboard.
          </p>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true); setError(null);
              try {
                const res = await fetch(`/api/admin/clients/${clientId}/invite`, { method: "POST" });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) { setError(data?.error ?? "Couldn't create an invite."); setBusy(false); return; }
                setLink(`${window.location.origin}${data.path}`);
                setDays(data.expiresInDays);
                setHadPassword(Boolean(data.hasPassword));
              } catch {
                setError("Couldn't reach the server.");
              }
              setBusy(false);
            }}
            className="w-fit rounded-full bg-[var(--ink)] px-4 py-2 text-[13.5px] font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create portal invite"}
          </button>
        </>
      )}

      {placeholder && (
        <p className="text-[12.5px] leading-relaxed text-[var(--ink-3)]">
          This client has no real email on file, so they&rsquo;ll sign in with their phone number.
        </p>
      )}
      {error && <p role="alert" className="text-[13px] text-[var(--alert)]">{error}</p>}
    </div>
  );
}
