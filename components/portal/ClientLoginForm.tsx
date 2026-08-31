"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ClientLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/portal";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mx-auto w-full max-w-[440px] rounded-[26px] border border-[var(--line)] bg-[var(--paper)] p-9 shadow-[0_22px_56px_rgba(15,46,61,0.09)]"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true); setError(null);
        try {
          const res = await fetch("/api/auth/client-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, password }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) { setError(data?.error ?? "Couldn't sign you in."); setBusy(false); return; }
          router.push(next);
          router.refresh();
        } catch {
          setError("Couldn't reach the server. Check your connection and try again.");
          setBusy(false);
        }
      }}
    >
      <h1 className="text-[clamp(30px,4vw,38px)]">Log in to Ozmo</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-[var(--ink-2)]">
        Your plan, your progress and your dietitian — all in one place.
      </p>

      <label className="mt-8 grid gap-2">
        <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">
          Phone or email
        </span>
        <input
          required autoComplete="username"
          value={identifier} onChange={(e) => setIdentifier(e.target.value)}
          className="min-h-[52px] rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 text-[16px]"
        />
      </label>

      <label className="mt-4 grid gap-2">
        <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Password</span>
        <input
          type="password" required autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="min-h-[52px] rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 text-[16px]"
        />
      </label>

      {error && (
        <p role="alert" className="mt-5 rounded-xl border border-[var(--alert)]/30 bg-[var(--alert)]/6 px-4 py-3 text-[14.5px] text-[var(--ink-2)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-7 inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[var(--ink)] px-6 text-[16px] font-semibold text-white transition-colors hover:bg-[#163B4D] disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Log in"}
      </button>

      <div className="mt-7 rounded-2xl border border-[var(--line)] bg-[var(--tint)] px-5 py-4">
        <p className="text-[14px] leading-relaxed text-[var(--ink-2)]">
          <strong className="text-[var(--ink)]">No login yet?</strong> Your dietitian sends a setup
          link once your programme starts. Message the clinic if you haven&rsquo;t had one.
        </p>
      </div>

      <p className="mt-6 text-[15px] text-[var(--ink-2)]">
        Not a client yet? <Link href="/assessment" className="underline">Start with the free assessment</Link>.
      </p>
    </form>
  );
}
