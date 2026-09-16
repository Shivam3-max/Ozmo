"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, field, FormError, SubmitButton } from "./form";
import { STAFF_ROLE_OPTIONS } from "@/lib/staff";
import EmailedNote, { type Emailed } from "./EmailedNote";

type Link = { name: string; url: string; days: number; reset: boolean; emailed: Emailed };

function CopyLink({ link, onDone }: { link: Link; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="grid gap-2 rounded-xl border border-[var(--good)]/30 bg-[var(--good)]/6 px-5 py-4">
      <p className="text-[14px] text-[var(--ink-2)]">
        <strong className="font-semibold text-[var(--ink)]">{link.reset ? `Reset link for ${link.name}` : `Setup link for ${link.name}`}.</strong>{" "}
        It works once and expires in {link.days} {link.days === 1 ? "day" : "days"}.
        {link.reset ? " Their current password keeps working until they use it." : ""}
      </p>
      <div className="flex items-center gap-2">
        <input readOnly value={link.url} onFocus={(e) => e.currentTarget.select()} className={`${field} bg-[var(--paper)] text-[12.5px]`} aria-label="Link" />
        <button
          type="button"
          onClick={async () => {
            try { await navigator.clipboard.writeText(link.url); setCopied(true); } catch { /* select and copy manually */ }
          }}
          className="shrink-0 rounded-full bg-[var(--ink)] px-4 py-2 text-[13px] font-semibold text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button type="button" onClick={onDone} className="shrink-0 px-2 text-[13px] text-[var(--ink-3)]">Done</button>
      </div>
      <EmailedNote status={link.emailed} what="the link to them" />
    </div>
  );
}

export function AddStaffForm() {
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", role: "DIETITIAN" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<Link | null>(null);

  if (link) return <CopyLink link={link} onDone={() => setLink(null)} />;

  return (
    <form
      className="grid gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true); setError(null);
        try {
          const res = await fetch("/api/admin/staff", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) { setError(data?.error ?? "Couldn't add that person."); setBusy(false); return; }
          setLink({ name: f.name, url: `${window.location.origin}${data.path}`, days: data.expiresInDays, reset: false, emailed: data.emailed });
          setF({ name: "", email: "", role: "DIETITIAN" });
          router.refresh();
        } catch {
          setError("Couldn't reach the server.");
        }
        setBusy(false);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required><input required className={field} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Work email" required><input required type="email" className={field} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
      </div>
      <fieldset className="grid gap-2">
        <legend className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Role</legend>
        {STAFF_ROLE_OPTIONS.map((r) => (
          <label key={r.value} className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-2.5 ${f.role === r.value ? "border-[var(--ink)] bg-[var(--tint)]" : "border-[var(--line)]"}`}>
            <input type="radio" name="role" value={r.value} checked={f.role === r.value} onChange={() => setF({ ...f, role: r.value })} className="mt-1" />
            <span>
              <span className="block text-[14px] font-semibold">{r.label}</span>
              <span className="block text-[13px] text-[var(--ink-2)]">{r.detail}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <FormError message={error} />
      <SubmitButton busy={busy}>Add and create setup link</SubmitButton>
    </form>
  );
}

export function StaffRowActions({
  id, name, role, isActive, isSelf,
}: {
  id: string; name: string; role: string; isActive: boolean; isSelf: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<Link | null>(null);

  const patch = async (body: Record<string, unknown>) => {
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data?.error ?? "Couldn't save that change.");
      else router.refresh();
    } catch {
      setError("Couldn't reach the server.");
    }
    setBusy(false);
  };

  if (link) return <CopyLink link={link} onDone={() => setLink(null)} />;
  if (isSelf) return <span className="text-[13px] text-[var(--ink-3)]">You</span>;

  return (
    <div className="grid justify-items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <label className="sr-only" htmlFor={`role-${id}`}>Role for {name}</label>
        <select
          id={`role-${id}`}
          value={role}
          disabled={busy || !isActive}
          onChange={(e) => {
            const next = e.target.value;
            if (confirm(`Change ${name}'s role? They'll be signed out and need to sign in again.`)) void patch({ role: next });
          }}
          className="min-h-[36px] rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 text-[13px]"
        >
          {STAFF_ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        {isActive && (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true); setError(null);
              try {
                const res = await fetch(`/api/admin/staff/${id}/reset`, { method: "POST" });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) setError(data?.error ?? "Couldn't create a link.");
                else setLink({ name, url: `${window.location.origin}${data.path}`, days: data.expiresInDays, reset: data.isReset, emailed: data.emailed });
              } catch {
                setError("Couldn't reach the server.");
              }
              setBusy(false);
            }}
            className="rounded-full border border-[var(--line)] px-3 py-1.5 text-[13px] font-semibold hover:border-[var(--ink)]"
          >
            Password link
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (confirm(isActive ? `Disable ${name}? They're signed out immediately and can't sign in until enabled again.` : `Enable ${name}'s account again?`)) {
              void patch({ isActive: !isActive });
            }
          }}
          className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${isActive ? "border border-[var(--alert)]/40 text-[var(--alert)]" : "bg-[var(--ink)] text-white"}`}
        >
          {isActive ? "Disable" : "Enable"}
        </button>
      </div>
      {error && <p role="alert" className="text-[12.5px] text-[var(--alert)]">{error}</p>}
    </div>
  );
}
