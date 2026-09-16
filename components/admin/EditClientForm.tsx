"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, field, FormError, SubmitButton, PREFERENCE_OPTIONS } from "./form";

export type EditableClient = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  occupation: string;
  emergencyContact: string;
  gender: string;
  dob: string;
  heightCm: string;
  targetWeightKg: string;
  targetDate: string;
  foodPreference: string;
  allergies: string;
  dislikes: string;
  status: string;
  primaryDietitianId: string;
  portalAccess: boolean;
};

const STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" },
  { value: "AT_RISK", label: "At risk" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived — hidden from the client list" },
];

const splitList = (value: string) => value.split(",").map((v) => v.trim()).filter(Boolean);

export default function EditClientForm({
  client,
  dietitians,
  canEditClinical,
  canChangePortal,
}: {
  client: EditableClient;
  dietitians: { id: string; name: string }[];
  canEditClinical: boolean;
  canChangePortal: boolean;
}) {
  const router = useRouter();
  const [f, setF] = useState(client);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof EditableClient>(k: K, v: EditableClient[K]) => setF((p) => ({ ...p, [k]: v }));

  return (
    <form
      className="grid max-w-[820px] gap-8"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        if (canChangePortal && client.portalAccess && !f.portalAccess &&
            !confirm("Turn off portal access? The client is signed out immediately and can't sign in until it's turned back on.")) {
          return;
        }
        setBusy(true); setError(null);
        const body: Record<string, unknown> = {
          name: f.name, phone: f.phone, email: f.email, city: f.city, occupation: f.occupation, emergencyContact: f.emergencyContact,
        };
        if (canEditClinical) {
          Object.assign(body, {
            gender: f.gender, dob: f.dob, heightCm: f.heightCm, targetWeightKg: f.targetWeightKg, targetDate: f.targetDate,
            foodPreference: f.foodPreference, allergies: splitList(f.allergies), dislikes: splitList(f.dislikes),
            status: f.status, primaryDietitianId: f.primaryDietitianId,
          });
        }
        if (canChangePortal) body.portalAccess = f.portalAccess;
        try {
          const res = await fetch(`/api/admin/clients/${client.id}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) { setError(data?.error ?? "Couldn't save those changes."); setBusy(false); return; }
          router.push(`/admin/clients/${client.id}`);
          router.refresh();
        } catch {
          setError("Couldn't reach the server.");
          setBusy(false);
        }
      }}
    >
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-[15px] font-semibold">Contact</legend>
        <Field label="Name" required><input required className={field} value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Phone" required hint="Indian numbers can be typed any way; others need the country code."><input required type="tel" className={field} value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Email" hint="Leave blank if they don't use email — they sign in with their phone."><input type="email" className={field} value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="City"><input className={field} value={f.city} onChange={(e) => set("city", e.target.value)} /></Field>
        <Field label="Occupation"><input className={field} value={f.occupation} onChange={(e) => set("occupation", e.target.value)} /></Field>
        <Field label="Emergency contact" hint="Name and number."><input className={field} value={f.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value)} /></Field>
      </fieldset>

      {canEditClinical ? (
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 text-[15px] font-semibold">Health &amp; programme</legend>
          <Field label="Status" required>
            <select className={field} value={f.status} onChange={(e) => set("status", e.target.value)}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Primary dietitian">
            <select className={field} value={f.primaryDietitianId} onChange={(e) => set("primaryDietitianId", e.target.value)}>
              <option value="">Not assigned</option>
              {dietitians.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Gender"><input className={field} value={f.gender} onChange={(e) => set("gender", e.target.value)} /></Field>
          <Field label="Date of birth"><input type="date" className={field} value={f.dob} onChange={(e) => set("dob", e.target.value)} /></Field>
          <Field label="Height (cm)"><input type="number" min={60} max={250} step="0.1" className={field} value={f.heightCm} onChange={(e) => set("heightCm", e.target.value)} /></Field>
          <Field label="Food preference">
            <select className={field} value={f.foodPreference} onChange={(e) => set("foodPreference", e.target.value)}>
              <option value="">Not recorded</option>
              {[...new Set([...PREFERENCE_OPTIONS, ...(f.foodPreference ? [f.foodPreference] : [])])].map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Target weight (kg)"><input type="number" min={20} max={300} step="0.1" className={field} value={f.targetWeightKg} onChange={(e) => set("targetWeightKg", e.target.value)} /></Field>
          <Field label="Target date"><input type="date" className={field} value={f.targetDate} onChange={(e) => set("targetDate", e.target.value)} /></Field>
          <Field label="Allergies" span hint="Separate with commas. The plan builder blocks anything that matches.">
            <input className={field} value={f.allergies} onChange={(e) => set("allergies", e.target.value)} />
          </Field>
          <Field label="Dislikes" span hint="Separate with commas. Flagged, not blocked.">
            <input className={field} value={f.dislikes} onChange={(e) => set("dislikes", e.target.value)} />
          </Field>
        </fieldset>
      ) : (
        <p className="text-[14px] text-[var(--ink-2)]">Health and programme details are changed by the dietitian or administrator.</p>
      )}

      {canChangePortal && (
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-[15px] font-semibold">Portal access</legend>
          <label className="flex items-start gap-3 text-[14.5px]">
            <input type="checkbox" className="mt-1 h-4 w-4" checked={f.portalAccess} onChange={(e) => set("portalAccess", e.target.checked)} />
            <span>
              Client can sign in to their dashboard
              <span className="block text-[13px] text-[var(--ink-2)]">Turn off when someone leaves the programme or asks for their data to be deleted.</span>
            </span>
          </label>
        </fieldset>
      )}

      <FormError message={error} />
      <SubmitButton busy={busy}>Save changes</SubmitButton>
    </form>
  );
}
