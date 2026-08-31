"use client";

import type { ReactNode } from "react";

export const field =
  "min-h-[42px] w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 text-[14.5px] focus:border-[var(--ink)] focus:outline-none";

export function Field({
  label, hint, required, children, span,
}: {
  label: string; hint?: string; required?: boolean; children: ReactNode; span?: boolean;
}) {
  return (
    <label className={`grid gap-1.5 ${span ? "sm:col-span-2" : ""}`}>
      <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">
        {label}
        {!required && <span className="ml-1 font-normal normal-case tracking-normal">(optional)</span>}
      </span>
      {children}
      {hint && <span className="text-[12.5px] text-[var(--ink-3)]">{hint}</span>}
    </label>
  );
}

export function TagPicker({
  options, value, onChange, columns = 2,
}: {
  options: string[]; value: string[]; onChange: (v: string[]) => void; columns?: number;
}) {
  const toggle = (o: string) =>
    onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o]);
  return (
    <div className={`grid gap-1.5 ${columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            type="button"
            key={o}
            onClick={() => toggle(o)}
            className={`rounded-lg border px-3 py-2 text-left text-[13.5px] transition-colors ${
              on ? "border-[var(--ink)] bg-[var(--accent)]/15 font-semibold" : "border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--ink)]"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-[var(--alert)]/30 bg-[var(--alert)]/6 px-4 py-3 text-[14px] text-[var(--ink-2)]">
      {message}
    </p>
  );
}

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex min-h-[46px] w-fit items-center justify-center rounded-full bg-[var(--ink)] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#163B4D] disabled:opacity-50"
    >
      {busy ? "Saving…" : children}
    </button>
  );
}

export const CONDITION_OPTIONS = [
  "Diabetes", "Pre-diabetes", "PCOS / PCOD", "Thyroid", "High cholesterol",
  "High blood pressure", "Fatty liver", "Digestive issues", "Anaemia",
  "Vitamin D / B12 deficiency", "Joint pain", "Heart condition",
  "Kidney condition", "Currently pregnant", "Recently gave birth",
];

export const GOAL_OPTIONS = [
  "Lose weight", "Gain weight", "Manage a health condition",
  "Build fitness or muscle", "Improve digestion", "Feel better overall",
];

export const PREFERENCE_OPTIONS = ["Vegetarian", "Vegetarian + eggs", "Non-vegetarian", "Vegan", "Jain"];
