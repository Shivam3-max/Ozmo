"use client";

import Link from "next/link";
import { useState } from "react";

const labelCls = "text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]";
const fieldCls =
  "min-h-[50px] rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 text-[16px]";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-8">
        <h3 className="text-[22px]">Thanks — we&rsquo;ve got it.</h3>
        <p className="mt-3 text-[16px] leading-relaxed text-[var(--ink-2)]">
          We usually reply within a working day. If it&rsquo;s urgent, WhatsApp is faster.
        </p>
        <button onClick={() => setSent(false)} className="mt-6 text-[15px] underline">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      className="grid gap-5 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <label className="grid gap-2">
        <span className={labelCls}>Name</span>
        <input type="text" required className={fieldCls} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className={labelCls}>Phone</span>
          <input type="tel" required className={fieldCls} />
        </label>
        <label className="grid gap-2">
          <span className={labelCls}>
            Email <span className="font-normal normal-case tracking-normal">(optional)</span>
          </span>
          <input type="email" className={fieldCls} />
        </label>
      </div>
      <label className="grid gap-2">
        <span className={labelCls}>What&rsquo;s this about?</span>
        <select required defaultValue="" className={fieldCls}>
          <option value="" disabled>Choose one</option>
          <option>Book a consultation</option>
          <option>Question about a programme</option>
          <option>Existing client support</option>
          <option>Something else</option>
        </select>
      </label>
      <label className="grid gap-2">
        <span className={labelCls}>Message</span>
        <textarea required rows={5} className="rounded-lg border border-[var(--line)] bg-[var(--paper)] p-4 text-[16px] leading-relaxed" />
      </label>
      <label className="flex items-start gap-3 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
        <input type="checkbox" required className="mt-1 h-4 w-4 shrink-0" />
        <span>
          I agree that Ozmo Diet Clinic may contact me about my enquiry. I&rsquo;ve read the{" "}
          <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
        </span>
      </label>
      <button
        type="submit"
        className="mt-1 inline-flex min-h-[50px] items-center justify-center rounded-lg bg-[var(--ink)] px-6 text-[16px] font-semibold text-white transition-colors hover:bg-[#163B4D]"
      >
        Send message
      </button>
    </form>
  );
}
