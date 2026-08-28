"use client";

import Link from "next/link";
import { useState } from "react";

const labelCls = "text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]";
const fieldCls =
  "min-h-[50px] rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 text-[16px]";

type Fields = { name: string; phone: string; email: string; topic: string; message: string; consent: boolean };

const EMPTY: Fields = { name: "", phone: "", email: "", topic: "", message: "", consent: false };

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState<Fields>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => setForm((f) => ({ ...f, [k]: v }));

  if (sent) {
    return (
      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-8">
        <h3 className="text-[22px]">Thanks — we&rsquo;ve got it.</h3>
        <p className="mt-3 text-[16px] leading-relaxed text-[var(--ink-2)]">
          We usually reply within a working day. If it&rsquo;s urgent, WhatsApp is faster.
        </p>
        <button onClick={() => { setSent(false); setForm(EMPTY); }} className="mt-6 text-[15px] underline">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      className="grid gap-5 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-6 sm:p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        setError(null);
        try {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setError(data?.error ?? "We couldn't send that. Please try again.");
            setBusy(false);
            return;
          }
          setSent(true);
        } catch {
          setError("We couldn't reach the server. Please check your connection and try again.");
        }
        setBusy(false);
      }}
    >
      <label className="grid gap-2">
        <span className={labelCls}>Name</span>
        <input type="text" required value={form.name} onChange={(e) => set("name", e.target.value)} className={fieldCls} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className={labelCls}>Phone</span>
          <input type="tel" required value={form.phone} onChange={(e) => set("phone", e.target.value)} className={fieldCls} />
        </label>
        <label className="grid gap-2">
          <span className={labelCls}>
            Email <span className="font-normal normal-case tracking-normal">(optional)</span>
          </span>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={fieldCls} />
        </label>
      </div>
      <label className="grid gap-2">
        <span className={labelCls}>What&rsquo;s this about?</span>
        <select required value={form.topic} onChange={(e) => set("topic", e.target.value)} className={fieldCls}>
          <option value="" disabled>Choose one</option>
          <option>Book a consultation</option>
          <option>Question about a programme</option>
          <option>Existing client support</option>
          <option>Something else</option>
        </select>
      </label>
      <label className="grid gap-2">
        <span className={labelCls}>Message</span>
        <textarea required rows={5} value={form.message} onChange={(e) => set("message", e.target.value)} className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 text-[16px] leading-relaxed" />
      </label>
      <label className="flex items-start gap-3 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
        <input type="checkbox" required checked={form.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1 h-4 w-4 shrink-0" />
        <span>
          I agree that Ozmo Diet Clinic may contact me about my enquiry. I&rsquo;ve read the{" "}
          <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
        </span>
      </label>
      {error && (
        <p role="alert" className="rounded-xl border border-[var(--alert)]/30 bg-[var(--alert)]/6 px-4 py-3 text-[14.5px] text-[var(--ink-2)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-1 inline-flex min-h-[54px] items-center justify-center rounded-full bg-[var(--ink)] px-7 text-[16px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#163B4D] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
