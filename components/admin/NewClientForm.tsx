"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, field, TagPicker, FormError, SubmitButton, CONDITION_OPTIONS, PREFERENCE_OPTIONS } from "./form";

export default function NewClientForm({
  programs,
}: {
  programs: { slug: string; name: string; durations: number[] }[];
}) {
  const router = useRouter();
  const [f, setF] = useState({
    name: "", phone: "", email: "", city: "", gender: "", age: "",
    heightCm: "", weightKg: "", foodPreference: "",
    programSlug: programs[0]?.slug ?? "", durationMonths: 3,
  });
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergyText, setAllergyText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const program = programs.find((p) => p.slug === f.programSlug);
  const durations = program?.durations?.length ? program.durations : [1, 3, 6];

  return (
    <form
      className="grid max-w-[760px] gap-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true); setError(null);
        try {
          const res = await fetch("/api/admin/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...f,
              age: f.age ? Number(f.age) : null,
              heightCm: f.heightCm ? Number(f.heightCm) : null,
              weightKg: f.weightKg ? Number(f.weightKg) : null,
              conditions,
              allergies: allergyText.split(",").map((a) => a.trim()).filter(Boolean),
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) { setError(data?.error ?? "Couldn't create this client."); setBusy(false); return; }
          router.push(`/admin/clients/${data.clientId}`);
        } catch {
          setError("Couldn't reach the server.");
          setBusy(false);
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required><input required className={field} value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Phone" required><input required type="tel" className={field} value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Email" hint="Needed later for the client portal invite."><input type="email" className={field} value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="City"><input className={field} value={f.city} onChange={(e) => set("city", e.target.value)} /></Field>
        <Field label="Gender">
          <select className={field} value={f.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="">Not stated</option><option>Female</option><option>Male</option><option>Other</option>
          </select>
        </Field>
        <Field label="Age"><input type="number" min={5} max={110} className={field} value={f.age} onChange={(e) => set("age", e.target.value)} /></Field>
        <Field label="Height (cm)"><input type="number" min={60} max={250} className={field} value={f.heightCm} onChange={(e) => set("heightCm", e.target.value)} /></Field>
        <Field label="Starting weight (kg)" hint="Recorded as their first measurement."><input type="number" step="0.1" min={20} max={300} className={field} value={f.weightKg} onChange={(e) => set("weightKg", e.target.value)} /></Field>
        <Field label="Food preference">
          <select className={field} value={f.foodPreference} onChange={(e) => set("foodPreference", e.target.value)}>
            <option value="">Not stated</option>
            {PREFERENCE_OPTIONS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Allergies" hint="Comma separated. The plan builder blocks these.">
          <input className={field} value={allergyText} onChange={(e) => setAllergyText(e.target.value)} placeholder="peanuts, lactose" />
        </Field>
      </div>

      <Field label="Conditions">
        <TagPicker options={CONDITION_OPTIONS} value={conditions} onChange={setConditions} columns={3} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Programme" required>
          <select className={field} value={f.programSlug} onChange={(e) => set("programSlug", e.target.value)}>
            {programs.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Duration" required>
          <div className="flex gap-2">
            {durations.map((d) => (
              <button
                type="button" key={d}
                onClick={() => set("durationMonths", d)}
                className={`tabular flex-1 rounded-lg border px-3 py-2 text-[14px] font-semibold ${
                  f.durationMonths === d ? "border-[var(--ink)] bg-[var(--accent)]/15" : "border-[var(--line)] text-[var(--ink-2)]"
                }`}
              >
                {d} mo
              </button>
            ))}
          </div>
        </Field>
      </div>

      <FormError message={error} />

      <div className="flex items-center gap-4">
        <SubmitButton busy={busy}>Create client</SubmitButton>
        <Link href="/admin/clients" className="text-[14px] text-[var(--ink-3)] hover:text-[var(--ink)]">Cancel</Link>
      </div>
      <p className="text-[13px] leading-relaxed text-[var(--ink-3)]">
        Creates the account, the enrollment, a health record and their starting weight — then opens
        the file so you can write a plan.
      </p>
    </form>
  );
}
