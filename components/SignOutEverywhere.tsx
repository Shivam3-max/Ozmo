"use client";

import { useState } from "react";

/** Ends every session for the signed-in person, including this one. */
export default function SignOutEverywhere({ scope, redirectTo }: { scope: "staff" | "client"; redirectTo: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          if (!confirm("Sign out on every phone and computer, including this one?")) return;
          setBusy(true); setError(null);
          try {
            const res = await fetch(`/api/auth/logout?scope=${scope}&everywhere=1`, { method: "POST" });
            if (!res.ok) throw new Error();
            window.location.assign(redirectTo);
          } catch {
            setError("Couldn't sign you out. Please try again.");
            setBusy(false);
          }
        }}
        className="w-fit rounded-full border border-[var(--line)] px-4 py-2 text-[14px] font-semibold hover:border-[var(--ink)] disabled:opacity-50"
      >
        {busy ? "Signing out…" : "Sign out everywhere"}
      </button>
      {error && <p role="alert" className="text-[13.5px] text-[var(--alert)]">{error}</p>}
    </div>
  );
}
