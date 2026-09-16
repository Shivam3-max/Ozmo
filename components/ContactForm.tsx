"use client";

import Link from "next/link";
import { useState } from "react";
import { normalizePhone } from "@/lib/phone";
import { apiFields, FieldError, useFieldErrors } from "./FieldErrors";

const labelCls = "text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]";
const fieldCls =
  "min-h-[50px] rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 text-[16px] aria-[invalid=true]:border-[var(--alert)]";

type Fields = { name: string; phone: string; email: string; topic: string; message: string; consent: boolean };

const EMPTY: Fields = { name: "", phone: "", email: "", topic: "", message: "", consent: false };
const ORDER = ["name", "phone", "email", "topic", "message", "consent"];
const PHONE_HINT = "Please enter a valid phone number, with the country code if it isn't Indian";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState<Fields>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errors = useFieldErrors("contact", ORDER);

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    errors.clear(k);
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-8" role="status">
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
        setError(null);
        // The browser accepts any text in a tel field; check it the way the server will.
        if (!normalizePhone(form.phone)) {
          errors.show({ phone: PHONE_HINT });
          setError("Please check your phone number.");
          return;
        }
        setBusy(true);
        try {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            const fields = apiFields(data);
            errors.show(fields);
            setError(Object.keys(fields).length ? "Please fix the highlighted fields." : data?.error ?? "We couldn't send that. Please try again.");
            setBusy(false);
            return;
          }
          errors.show({});
          setSent(true);
        } catch {
          setError("We couldn't reach the server. Please check your connection and try again.");
        }
        setBusy(false);
      }}
    >
      <div className="grid gap-2">
        <label htmlFor={errors.inputProps("name").id} className={labelCls}>Name</label>
        <input type="text" required autoComplete="name" maxLength={120} value={form.name} onChange={(e) => set("name", e.target.value)} className={fieldCls} {...errors.inputProps("name")} />
        <FieldError id={errors.errorIdFor("name")} message={errors.fields.name} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid content-start gap-2">
          <label htmlFor={errors.inputProps("phone").id} className={labelCls}>Phone</label>
          <input type="tel" required autoComplete="tel" inputMode="tel" maxLength={24} value={form.phone} onChange={(e) => set("phone", e.target.value)} className={fieldCls} {...errors.inputProps("phone")} />
          <FieldError id={errors.errorIdFor("phone")} message={errors.fields.phone} />
        </div>
        <div className="grid content-start gap-2">
          <label htmlFor={errors.inputProps("email").id} className={labelCls}>
            Email <span className="font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <input type="email" autoComplete="email" maxLength={200} value={form.email} onChange={(e) => set("email", e.target.value)} className={fieldCls} {...errors.inputProps("email")} />
          <FieldError id={errors.errorIdFor("email")} message={errors.fields.email} />
        </div>
      </div>
      <div className="grid gap-2">
        <label htmlFor={errors.inputProps("topic").id} className={labelCls}>What&rsquo;s this about?</label>
        <select required value={form.topic} onChange={(e) => set("topic", e.target.value)} className={fieldCls} {...errors.inputProps("topic")}>
          <option value="" disabled>Choose one</option>
          <option>Book a consultation</option>
          <option>Question about a programme</option>
          <option>Existing client support</option>
          <option>Something else</option>
        </select>
        <FieldError id={errors.errorIdFor("topic")} message={errors.fields.topic} />
      </div>
      <div className="grid gap-2">
        <label htmlFor={errors.inputProps("message").id} className={labelCls}>Message</label>
        <textarea required rows={5} maxLength={4000} value={form.message} onChange={(e) => set("message", e.target.value)} className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 text-[16px] leading-relaxed aria-[invalid=true]:border-[var(--alert)]" {...errors.inputProps("message")} />
        <FieldError id={errors.errorIdFor("message")} message={errors.fields.message} />
      </div>
      <div className="grid gap-2">
        <label className="flex items-start gap-3 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          <input type="checkbox" required checked={form.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1 h-4 w-4 shrink-0" {...errors.inputProps("consent")} />
          <span>
            I agree that Ozmo Diet Clinic may contact me about my enquiry. I&rsquo;ve read the{" "}
            <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
          </span>
        </label>
        <FieldError id={errors.errorIdFor("consent")} message={errors.fields.consent} />
      </div>
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
