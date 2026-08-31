"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";

export default function SetupForm({ token, name }: { token: string; name: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tooShort = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && password !== confirm;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy || tooShort || mismatch) return;
        setBusy(true); setError(null);
        try {
          const res = await fetch("/api/portal/setup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) { setError(data?.error ?? "Couldn't set that up."); setBusy(false); return; }
          router.push("/portal");
          router.refresh();
        } catch {
          setError("Couldn't reach the server. Check your connection and try again.");
          setBusy(false);
        }
      }}
    >
      <Logo size={22} />
      <h1 className="mt-6 font-[var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">
        Welcome, {name}
      </h1>
      <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
        Choose a password and your dashboard is ready — your plan, your progress, and a direct line
        to your dietitian.
      </p>

      <label className="mt-7 grid gap-2">
        <span className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Password</span>
        <input
          type="password" required autoComplete="new-password" minLength={8}
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="min-h-[48px] rounded-xl border border-[var(--line)] px-4 text-[15.5px]"
        />
        {tooShort && <span className="text-[13px] text-[var(--alert)]">At least 8 characters.</span>}
      </label>

      <label className="mt-4 grid gap-2">
        <span className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Confirm password</span>
        <input
          type="password" required autoComplete="new-password"
          value={confirm} onChange={(e) => setConfirm(e.target.value)}
          className="min-h-[48px] rounded-xl border border-[var(--line)] px-4 text-[15.5px]"
        />
        {mismatch && <span className="text-[13px] text-[var(--alert)]">These don&rsquo;t match.</span>}
      </label>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-[var(--alert)]/30 bg-[var(--alert)]/6 px-4 py-3 text-[14px] text-[var(--ink-2)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || tooShort || mismatch || !password}
        className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-[var(--ink)] px-6 text-[15.5px] font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Setting up…" : "Open my dashboard"}
      </button>

      <p className="mt-5 text-[12.5px] leading-relaxed text-[var(--ink-3)]">
        Your health information is private to you and your dietitian. We never sell it, and you can
        export or delete it at any time from your settings.
      </p>
    </form>
  );
}
