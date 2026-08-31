"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, field, TagPicker, FormError, SubmitButton } from "./form";
import { CATEGORIES, COMMON_UNITS, CONDITION_TAGS, ALLERGENS, ITEM_TYPE_VALUES } from "@/lib/food-schema";
import { ITEM_TYPES } from "@/lib/plan-types";

export type FoodValues = {
  id?: string;
  name: string;
  alternateNames: string[];
  category: string;
  servingUnit: string;
  servingGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  glycemicTag: string | null;
  conditionTags: string[];
  isVeg: boolean;
  isVegan: boolean;
  isJain: boolean;
  allergens: string[];
  defaultType: string;
  isPrep: boolean;
  isVerified: boolean;
  usedInPlans?: number;
};

const EMPTY: FoodValues = {
  name: "", alternateNames: [], category: "Grains", servingUnit: "katori", servingGrams: 100,
  calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0,
  glycemicTag: null, conditionTags: [], isVeg: true, isVegan: false, isJain: false,
  allergens: [], defaultType: "FOOD", isPrep: false, isVerified: true,
};

export default function FoodForm({ initial }: { initial?: FoodValues }) {
  const router = useRouter();
  const editing = Boolean(initial?.id);
  const [f, setF] = useState<FoodValues>(initial ?? EMPTY);
  const [altText, setAltText] = useState((initial?.alternateNames ?? []).join(", "));
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof FoodValues>(k: K, v: FoodValues[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setSaved(false);
  };

  // Nutrition is irrelevant for a breathing exercise or a walk.
  const isNutritional = !["EXERCISE", "BREATHWORK", "LIFESTYLE", "NOTE"].includes(f.defaultType);

  return (
    <form
      className="grid max-w-[820px] gap-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true); setError(null); setSaved(false);
        const body = { ...f, alternateNames: altText.split(",").map((a) => a.trim()).filter(Boolean) };
        try {
          const res = await fetch(editing ? `/api/admin/foods/${initial!.id}` : "/api/admin/foods", {
            method: editing ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) { setError(data?.error ?? "Couldn't save."); setBusy(false); return; }
          if (editing) { setSaved(true); router.refresh(); }
          else router.push("/admin/foods");
        } catch {
          setError("Couldn't reach the server.");
        }
        setBusy(false);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required span>
          <input required className={field} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Moong dal cheela" />
        </Field>
        <Field label="Also known as" hint="Comma separated — search finds all of them." span>
          <input className={field} value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="cheela, chilla, pudla" />
        </Field>

        <Field label="Category" required>
          <select className={field} value={f.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Row type in a plan" required hint="What it becomes when you insert it.">
          <select className={field} value={f.defaultType} onChange={(e) => set("defaultType", e.target.value)}>
            {ITEM_TYPES.filter((t) => (ITEM_TYPE_VALUES as readonly string[]).includes(t.value)).map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Serving unit" required>
          <input required list="units" className={field} value={f.servingUnit} onChange={(e) => set("servingUnit", e.target.value)} />
          <datalist id="units">{COMMON_UNITS.map((u) => <option key={u} value={u} />)}</datalist>
        </Field>
        <Field label="Grams per serving" hint="Leave at 0 for practices and supplements.">
          <input type="number" step="0.1" min={0} className={field} value={f.servingGrams} onChange={(e) => set("servingGrams", Number(e.target.value))} />
        </Field>
      </div>

      {isNutritional && (
        <div>
          <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">
            Per 1 {f.servingUnit || "serving"}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {([
              ["calories", "kcal"], ["protein", "Protein g"], ["carbs", "Carbs g"],
              ["fat", "Fat g"], ["fibre", "Fibre g"],
            ] as const).map(([k, label]) => (
              <label key={k} className="grid gap-1.5">
                <span className="text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--ink-3)]">{label}</span>
                <input
                  type="number" step="0.1" min={0}
                  className={`${field} tabular`}
                  value={f[k]}
                  onChange={(e) => set(k, Number(e.target.value))}
                />
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Glycemic tag">
          <select className={field} value={f.glycemicTag ?? ""} onChange={(e) => set("glycemicTag", e.target.value || null)}>
            <option value="">Not set</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
        </Field>
        <Field label="Dietary flags">
          <div className="flex flex-wrap gap-2 pt-1">
            {([["isVeg", "Vegetarian"], ["isVegan", "Vegan"], ["isJain", "Jain-safe"], ["isPrep", "Standing prep"]] as const).map(([k, label]) => (
              <button
                type="button" key={k}
                onClick={() => set(k, !f[k])}
                className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold ${
                  f[k] ? "border-[var(--ink)] bg-[var(--accent)]/15" : "border-[var(--line)] text-[var(--ink-2)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <Field label="Condition tags" hint="Used to surface the right items when building for a condition.">
        <TagPicker options={CONDITION_TAGS} value={f.conditionTags} onChange={(v) => set("conditionTags", v)} columns={3} />
      </Field>

      <Field label="Allergens" hint="The plan builder blocks these against a client's stated allergies.">
        <TagPicker options={ALLERGENS} value={f.allergens} onChange={(v) => set("allergens", v)} columns={3} />
      </Field>

      <label className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--tint)] px-5 py-4">
        <input type="checkbox" checked={f.isVerified} onChange={(e) => set("isVerified", e.target.checked)} className="mt-1 h-4 w-4 shrink-0" />
        <span className="text-[14px] leading-relaxed text-[var(--ink-2)]">
          <strong className="text-[var(--ink)]">Verified.</strong> Tick this once you&rsquo;ve confirmed the
          values are right for the portion you actually use. Seeded items start unverified on purpose —
          plans built on wrong numbers reach real clients.
        </span>
      </label>

      <FormError message={error} />
      {saved && <p className="text-[14px] font-semibold text-[var(--good)]">Saved.</p>}

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton busy={busy}>{editing ? "Save changes" : "Add to library"}</SubmitButton>
        <Link href="/admin/foods" className="text-[14px] text-[var(--ink-3)] hover:text-[var(--ink)]">
          {editing ? "Back to library" : "Cancel"}
        </Link>

        {editing && (
          <button
            type="button"
            disabled={deleting}
            onClick={async () => {
              if (!confirm(`Delete "${f.name}" from the library? This cannot be undone.`)) return;
              setDeleting(true); setError(null);
              try {
                const res = await fetch(`/api/admin/foods/${initial!.id}`, { method: "DELETE" });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) { setError(data?.error ?? "Couldn't delete."); setDeleting(false); return; }
                router.push("/admin/foods");
              } catch {
                setError("Couldn't reach the server.");
                setDeleting(false);
              }
            }}
            className="ml-auto rounded-full border border-[var(--alert)]/40 px-4 py-2.5 text-[13.5px] font-semibold text-[var(--alert)] hover:bg-[var(--alert)]/8 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>

      {editing && (initial?.usedInPlans ?? 0) > 0 && (
        <p className="text-[13px] text-[var(--ink-3)]">
          Used in {initial!.usedInPlans} plan {initial!.usedInPlans === 1 ? "row" : "rows"} — it can&rsquo;t be deleted while that&rsquo;s true.
        </p>
      )}
    </form>
  );
}
