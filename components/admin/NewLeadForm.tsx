"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, field, TagPicker, FormError, SubmitButton, CONDITION_OPTIONS, GOAL_OPTIONS } from "./form";

const SOURCES = [
  { value: "WALK_IN", label: "Walk-in" },
  { value: "PHONE", label: "Phone call" },
  { value: "REFERRAL", label: "Referral" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "GOOGLE_ADS", label: "Google Ads" },
  { value: "OTHER", label: "Other" },
];

const READINESS = ["Just exploring", "Thinking about it", "Fairly serious", "Ready to start", "Needs to start now"];

export default function NewLeadForm() {
  const router = useRouter();
  const [f, setF] = useState({
    name: "", phone: "", email: "", city: "", source: "WALK_IN", goal: "", readiness: 3, note: "",
  });
  const [conditions, setConditions] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dupe, setDupe] = useState<string | null>(null);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  return (
    <form
      className="grid max-w-[760px] gap-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true); setError(null); setDupe(null);
        try {
          const res = await fetch("/api/admin/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...f, conditions }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setError(data?.error ?? "Couldn't save this lead.");
            if (data?.leadId) setDupe(data.leadId);
            setBusy(false);
            return;
          }
          router.push(`/admin/leads/${data.leadId}`);
        } catch {
          setError("Couldn't reach the server.");
          setBusy(false);
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required><input required className={field} value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Phone" required><input required type="tel" className={field} value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Email"><input type="email" className={field} value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="City"><input className={field} value={f.city} onChange={(e) => set("city", e.target.value)} /></Field>
        <Field label="How they came to us" required>
          <select className={field} value={f.source} onChange={(e) => set("source", e.target.value)}>
            {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="Main goal">
          <select className={field} value={f.goal} onChange={(e) => set("goal", e.target.value)}>
            <option value="">Not stated</option>
            {GOAL_OPTIONS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </Field>
      </div>

      <Field label="How ready are they" hint="Drives where they sit in the leads list — the queue is sorted by score.">
        <div className="flex flex-wrap gap-2">
          {READINESS.map((r, i) => (
            <button
              type="button" key={r}
              onClick={() => set("readiness", i + 1)}
              className={`rounded-full border px-3.5 py-2 text-[13.5px] font-semibold ${
                f.readiness === i + 1 ? "border-[var(--ink)] bg-[var(--accent)]/15" : "border-[var(--line)] text-[var(--ink-2)]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Conditions they mentioned" hint="Heart, kidney or pregnancy flags the lead for a doctor's involvement first.">
        <TagPicker options={CONDITION_OPTIONS} value={conditions} onChange={setConditions} columns={3} />
      </Field>

      <Field label="Note" span>
        <textarea rows={3} className="rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3 text-[14.5px] leading-relaxed" value={f.note} onChange={(e) => set("note", e.target.value)} placeholder="Walked in asking about the PCOS programme. Wants to start after Diwali." />
      </Field>

      <FormError message={error} />
      {dupe && (
        <Link href={`/admin/leads/${dupe}`} className="text-[14px] font-semibold text-[var(--accent-text)]">
          Open the existing record →
        </Link>
      )}

      <div className="flex items-center gap-4">
        <SubmitButton busy={busy}>Add lead</SubmitButton>
        <Link href="/admin/leads" className="text-[14px] text-[var(--ink-3)] hover:text-[var(--ink)]">Cancel</Link>
      </div>
      <p className="text-[13px] leading-relaxed text-[var(--ink-3)]">
        Adding someone here records consent as given in person. Only add people who have
        actually asked to hear from the clinic.
      </p>
    </form>
  );
}
