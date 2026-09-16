"use client";

import { useState } from "react";
import EmailedNote, { type Emailed } from "./EmailedNote";

export default function PortalInvite({
  clientId,
  email,
  hasPassword,
  canInvite,
  canReset,
}: {
  clientId: string;
  email: string;
  hasPassword: boolean;
  canInvite: boolean;
  canReset: boolean;
}) {
  const [link, setLink] = useState<string | null>(null);
  const [days, setDays] = useState(14);
  const [emailed, setEmailed] = useState<Emailed>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const placeholder = email.endsWith("@no-email.ozmo.local");

  const issue = async (reset: boolean) => {
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.error ?? "Couldn't create a link."); setBusy(false); return; }
      setLink(`${window.location.origin}${data.path}`);
      setDays(data.expiresInDays);
      setEmailed(data.emailed);
    } catch {
      setError("Couldn't reach the server.");
    }
    setBusy(false);
  };

  const button = "w-fit rounded-full bg-[var(--ink)] px-4 py-2 text-[13.5px] font-semibold text-white disabled:opacity-50";
  const note = "text-[13.5px] leading-relaxed text-[var(--ink-2)]";

  let body: React.ReactNode;
  if (link) {
    body = (
      <>
        <p className={note}>
          {hasPassword
            ? "If you share this reset link yourself, send it only to the client. Their current password stops working once they use it, and they'll be signed out everywhere."
            : "The client uses this link once to set their own password."}
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
        <EmailedNote status={emailed} what="the link to the client" />
      </>
    );
  } else if (!canInvite) {
    body = (
      <p className={note}>
        {hasPassword ? "This client has portal access." : "No portal access yet."} Portal links are issued by the
        dietitian or the clinic administrator.
      </p>
    );
  } else if (!hasPassword) {
    body = (
      <>
        <p className={note}>Generate a link the client uses once to set their own password and open their dashboard.</p>
        <button disabled={busy} onClick={() => issue(false)} className={button}>
          {busy ? "Creating…" : "Create portal invite"}
        </button>
      </>
    );
  } else if (!canReset) {
    body = (
      <p className={note}>
        This client already has portal access. If they&rsquo;re locked out, ask the clinic administrator for a reset link.
      </p>
    );
  } else if (!confirmReset) {
    body = (
      <>
        <p className={note}>This client already has portal access.</p>
        <button
          onClick={() => setConfirmReset(true)}
          className="w-fit rounded-full border border-[var(--line)] px-4 py-2 text-[13.5px] font-semibold hover:border-[var(--ink)]"
        >
          Reset portal password…
        </button>
      </>
    );
  } else {
    body = (
      <>
        <p className={note}>
          Only do this after confirming the request came from the client. Anyone holding the link can open their
          health record.
        </p>
        <div className="flex flex-wrap gap-2">
          <button disabled={busy} onClick={() => issue(true)} className={button}>
            {busy ? "Creating…" : "Create reset link"}
          </button>
          <button onClick={() => setConfirmReset(false)} className="rounded-full px-3 py-2 text-[13.5px] text-[var(--ink-3)]">
            Cancel
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="grid gap-3">
      {body}
      {placeholder && (
        <p className="text-[12.5px] leading-relaxed text-[var(--ink-3)]">
          This client has no real email on file, so they&rsquo;ll sign in with their phone number.
        </p>
      )}
      {error && <p role="alert" className="text-[13px] text-[var(--alert)]">{error}</p>}
    </div>
  );
}
