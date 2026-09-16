"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";
import { passwordProblem, PASSWORD_MAX, PASSWORD_MIN } from "@/lib/password-policy";

export default function SetupForm({ token, name }: { token: string; name: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Checked here for instant feedback; the server repeats it, including the
  // "not your name or phone" rule, which needs details this page doesn't hold.
  const problem = password.length > 0 ? passwordProblem(password) : null;
  const mismatch = confirm.length > 0 && password !== confirm;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy || problem || mismatch) return;
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

      {/* Hints sit outside the <label> so the field's name is just "Password"; they're linked with aria-describedby. */}
      <div className="mt-7 grid gap-2">
        <label htmlFor="setup-password" className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Password</label>
        <input
          id="setup-password"
          type="password" required autoComplete="new-password" minLength={PASSWORD_MIN} maxLength={PASSWORD_MAX}
          aria-describedby="password-hint"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="min-h-[48px] rounded-xl border border-[var(--line)] px-4 text-[15.5px]"
        />
        <span id="password-hint" className={`text-[13px] ${problem ? "text-[var(--alert)]" : "text-[var(--ink-2)]"}`}>
          {problem ?? `At least ${PASSWORD_MIN} characters. A short phrase is easier to remember than symbols.`}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        <label htmlFor="setup-confirm" className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Confirm password</label>
        <input
          id="setup-confirm"
          aria-describedby={mismatch ? "setup-confirm-error" : undefined}
          type="password" required autoComplete="new-password"
          value={confirm} onChange={(e) => setConfirm(e.target.value)}
          className="min-h-[48px] rounded-xl border border-[var(--line)] px-4 text-[15.5px]"
        />
        {mismatch && <span id="setup-confirm-error" className="text-[13px] text-[var(--alert)]">These don&rsquo;t match.</span>}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-[var(--alert)]/30 bg-[var(--alert)]/6 px-4 py-3 text-[14px] text-[var(--ink-2)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || Boolean(problem) || mismatch || !password}
        className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-[var(--ink)] px-6 text-[15.5px] font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Setting up…" : "Open my dashboard"}
      </button>

      <p className="mt-5 text-[12.5px] leading-relaxed text-[var(--ink-3)]">
        Your health information is private to you and your dietitian. We never sell it. You can
        download a copy at any time from your profile, or ask the clinic to delete it.
      </p>
    </form>
  );
}
