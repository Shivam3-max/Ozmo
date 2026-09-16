"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { passwordProblem, PASSWORD_MAX } from "@/lib/password-policy";

const label = "text-[12.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]";
const input = "min-h-[48px] rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 text-[15.5px]";

/**
 * Choose-a-password form used for staff setup links and signed-in password
 * changes. `endpoint` receives { token?, currentPassword?, password|newPassword }.
 */
export default function PasswordFields({
  mode,
  scope,
  endpoint,
  token,
  minLength,
  submitLabel,
  redirectTo,
}: {
  mode: "setup" | "change";
  /** For "change": which session the password belongs to. */
  scope?: "staff" | "client";
  endpoint: string;
  token?: string;
  minLength: number;
  submitLabel: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const problem = password.length > 0 ? passwordProblem(password, {}, minLength) : null;
  const mismatch = confirm.length > 0 && password !== confirm;
  const blocked = busy || Boolean(problem) || mismatch || !password || (mode === "change" && !current);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (blocked) return;
        setBusy(true); setError(null); setDone(false);
        try {
          const body = mode === "setup" ? { token, password } : { scope, currentPassword: current, newPassword: password };
          const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) { setError(data?.error ?? "Couldn't save that password."); setBusy(false); return; }
          if (redirectTo) { router.push(redirectTo); router.refresh(); return; }
          setDone(true); setCurrent(""); setPassword(""); setConfirm("");
        } catch {
          setError("Couldn't reach the server. Check your connection and try again.");
        }
        setBusy(false);
      }}
    >
      {mode === "change" && (
        <label className="grid gap-2">
          <span className={label}>Current password</span>
          <input type="password" required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={input} />
        </label>
      )}
      {/* Hints sit outside the <label> so the field's name stays short; they're linked with aria-describedby. */}
      <div className="grid gap-2">
        <label htmlFor="new-password" className={label}>{mode === "change" ? "New password" : "Password"}</label>
        <input
          id="new-password"
          type="password" required autoComplete="new-password" minLength={minLength} maxLength={PASSWORD_MAX}
          aria-describedby="new-password-hint"
          value={password} onChange={(e) => setPassword(e.target.value)} className={input}
        />
        <span id="new-password-hint" className={`text-[13px] ${problem ? "text-[var(--alert)]" : "text-[var(--ink-2)]"}`}>
          {problem ?? `At least ${minLength} characters. A short phrase is easier to remember than symbols.`}
        </span>
      </div>
      <div className="grid gap-2">
        <label htmlFor="confirm-password" className={label}>Confirm password</label>
        <input
          id="confirm-password" type="password" required autoComplete="new-password"
          aria-describedby={mismatch ? "confirm-password-error" : undefined}
          value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input}
        />
        {mismatch && <span id="confirm-password-error" className="text-[13px] text-[var(--alert)]">These don&rsquo;t match.</span>}
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-[var(--alert)]/30 bg-[var(--alert)]/6 px-4 py-3 text-[14px] text-[var(--ink-2)]">{error}</p>
      )}
      {done && (
        <p role="status" className="rounded-xl border border-[var(--good)]/30 bg-[var(--good)]/6 px-4 py-3 text-[14px] text-[var(--ink-2)]">
          Password changed. Any other devices have been signed out.
        </p>
      )}

      <button
        type="submit"
        disabled={blocked}
        className="inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-[var(--ink)] px-6 text-[15.5px] font-semibold text-white disabled:opacity-50 sm:w-fit"
      >
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
