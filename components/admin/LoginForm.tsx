"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";
import { safeRedirectPath } from "@/lib/safe-redirect";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeRedirectPath(params.get("next"), "/admin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="w-full max-w-[400px] rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        setError(null);
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setError(data?.error ?? "Sign in failed. Please try again.");
            setBusy(false);
            return;
          }
          router.push(next);
          router.refresh();
        } catch {
          setError("Couldn't reach the server. Check your connection and try again.");
          setBusy(false);
        }
      }}
    >
      <Logo size={22} />
      <h1 className="mt-6 font-[var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">
        Staff sign in
      </h1>
      <p className="mt-2 text-[14.5px] text-[var(--ink-2)]">
        This area holds client health records. Sessions expire after 8 hours.
      </p>

      <label className="mt-7 grid gap-2">
        <span className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Email</span>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-[48px] rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 text-[15.5px]"
        />
      </label>

      <label className="mt-4 grid gap-2">
        <span className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="min-h-[48px] rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 text-[15.5px]"
        />
      </label>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-[var(--alert)]/30 bg-[var(--alert)]/6 px-4 py-3 text-[14px] text-[var(--ink-2)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-[var(--ink)] px-6 text-[15.5px] font-semibold text-white transition-colors hover:bg-[#163B4D] disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>

      <p className="mt-5 text-[13.5px] leading-relaxed text-[var(--ink-2)]">
        Forgotten your password or locked out? Ask the clinic administrator for a reset link — it arrives from them,
        never by email from Ozmo.
      </p>
    </form>
  );
}
