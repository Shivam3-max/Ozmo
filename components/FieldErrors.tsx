"use client";

import { useCallback, useState } from "react";

/**
 * Per-field error messages for public forms. The API answers a rejected form
 * with `{ error, fields: { phone: "…" } }`; this shows each message under its
 * field, marks the field invalid for screen readers and moves focus to the
 * first one, instead of a bare "Please check the form."
 */
export function useFieldErrors(formId: string, order: string[]) {
  const [fields, setFields] = useState<Record<string, string>>({});

  const idFor = (name: string) => `${formId}-${name}`;
  const errorIdFor = (name: string) => `${formId}-${name}-error`;

  /** Props for an input: its id, invalid state and the error it's described by. */
  const inputProps = (name: string) => ({
    id: idFor(name),
    "aria-invalid": fields[name] ? (true as const) : undefined,
    "aria-describedby": fields[name] ? errorIdFor(name) : undefined,
  });

  const show = useCallback(
    (next: Record<string, string>) => {
      setFields(next);
      const first = order.find((name) => next[name]);
      if (first) {
        // After React paints the messages.
        requestAnimationFrame(() => document.getElementById(`${formId}-${first}`)?.focus());
      }
      return first;
    },
    [formId, order]
  );

  const clear = (name: string) => setFields((f) => (f[name] ? { ...f, [name]: "" } : f));

  return { fields, show, clear, inputProps, errorIdFor, hasErrors: Object.values(fields).some(Boolean) };
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="text-[14px] font-medium text-[var(--alert)]">
      {message}
    </span>
  );
}

/** Field-level messages the API returned, keyed by field name. */
export const apiFields = (data: unknown): Record<string, string> =>
  data && typeof data === "object" && "fields" in data && data.fields && typeof data.fields === "object"
    ? (data.fields as Record<string, string>)
    : {};
