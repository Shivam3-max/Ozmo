"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { normalizePhone } from "@/lib/phone";
import { apiFields, FieldError, useFieldErrors } from "./FieldErrors";

const types = [
  { id: "clinic", name: "In-clinic consultation", desc: "At our clinic — the full works, with measurements taken in person." },
  { id: "video", name: "Online video consultation", desc: "From wherever you are. Same programme, same plan, same dashboard." },
];

const slots = ["10:00", "10:45", "11:30", "12:15", "15:00", "15:45", "16:30", "17:15", "18:00"];
const labelCls = "text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]";
const fieldCls = "min-h-[50px] rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 text-[16px] aria-[invalid=true]:border-[var(--alert)]";
const ORDER = ["name", "phone", "email", "reason", "notes", "acceptTerms", "acceptDisclaimer"];
const PHONE_HINT = "Please enter a valid phone number, with the country code if it isn't Indian";

function nextDays(n: number) {
  const out: Date[] = [];
  const d = new Date();
  while (out.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) out.push(new Date(d));
  }
  return out;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Details = { name: string; phone: string; email: string; reason: string; notes: string };

export default function BookingForm() {
  const [type, setType] = useState("clinic");
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<Details>({ name: "", phone: "", email: "", reason: "", notes: "" });
  const [terms, setTerms] = useState(false);
  const [disclaimer, setDisclaimer] = useState(false);
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availabilityVersion, setAvailabilityVersion] = useState(0);
  const days = nextDays(8);
  const errors = useFieldErrors("booking", ORDER);

  useEffect(() => {
    if (!day) return;
    fetch(`/api/booking?date=${encodeURIComponent(day)}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => setUnavailable(new Set(Array.isArray(data.booked) ? data.booked : [])))
      .catch(() => setUnavailable(new Set(slots)))
      .finally(() => setLoadingSlots(false));
  }, [day, availabilityVersion]);

  const set = <K extends keyof Details>(k: K, v: Details[K]) => {
    setDetails((d) => ({ ...d, [k]: v }));
    errors.clear(k);
  };

  if (confirmed) {
    return (
      <div className="max-w-[640px] rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-8">
        <h2 className="text-[28px]">You&rsquo;re booked.</h2>
        <dl className="mt-6 grid gap-3 border-y border-[var(--line)] py-5 text-[15.5px]">
          {[
            ["Type", types.find((t) => t.id === type)!.name],
            ["Date", day ? new Date(`${day}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "—"],
            ["Time", slot ? `${slot} IST` : "—"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6">
              <dt className="text-[var(--ink-3)]">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <h3 className="mt-7 text-[18px]">What happens next</h3>
        <ol className="mt-3 grid list-decimal gap-2 pl-5 text-[15.5px] leading-relaxed text-[var(--ink-2)]">
          <li>The clinic will contact you to confirm that the requested slot is available.</li>
          <li>If you&rsquo;re consulting online, we&rsquo;ll email your video-call link once the appointment is confirmed.</li>
          <li>Bring any lab reports from the last six months and a list of your medications.</li>
          <li>
            Haven&rsquo;t done the health assessment yet? It makes the consultation much more useful —{" "}
            <Link href="/assessment" className="underline">take it now</Link>.
          </li>
        </ol>
        <p className="mt-6 text-[13.5px] text-[var(--ink-3)]">
          Our team will confirm your slot directly. If you need to change it, just message us.
        </p>
      </div>
    );
  }

  return (
    <form
      className="grid max-w-[760px] gap-10"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy || !day || !slot) return;
        setError(null);
        // The browser accepts any text in a tel field; check it the way the server will.
        if (!normalizePhone(details.phone)) {
          errors.show({ phone: PHONE_HINT });
          setError("Please check your phone number.");
          return;
        }
        setBusy(true);
        try {
          const res = await fetch("/api/booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type,
              date: day,
              time: slot,
              ...details,
              acceptTerms: terms,
              acceptDisclaimer: disclaimer,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            const fields = apiFields(data);
            errors.show(fields);
            setError(Object.keys(fields).length ? "Please fix the highlighted fields." : data?.error ?? "We couldn't confirm that booking. Please try again.");
            if (data?.slotTaken) {
              // Someone else got there first — show the day as it is now.
              setSlot(null);
              setAvailabilityVersion((v) => v + 1);
            }
            setBusy(false);
            return;
          }
          setConfirmed(true);
        } catch {
          setError("We couldn't reach the server. Please check your connection and try again.");
        }
        setBusy(false);
      }}
    >
      {/* step 1 */}
      <fieldset className="grid gap-4">
        <legend className="mb-2 font-[var(--font-display)] text-[21px] font-semibold">
          1 · Consultation type
        </legend>
        {types.map((t) => (
          <label
            key={t.id}
            className={`flex cursor-pointer gap-4 rounded-xl border px-5 py-4 transition-colors ${
              type === t.id ? "border-[var(--ink)] bg-[var(--accent)]/12" : "border-[var(--line)] hover:border-[var(--ink)]"
            }`}
          >
            <input
              type="radio"
              name="type"
              value={t.id}
              checked={type === t.id}
              onChange={() => setType(t.id)}
              className="mt-1.5 h-4 w-4 shrink-0"
            />
            <span>
              <span className="block text-[16.5px] font-semibold">{t.name}</span>
              <span className="mt-1 block text-[14.5px] leading-relaxed text-[var(--ink-2)]">{t.desc}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {/* step 2 */}
      <fieldset className="grid gap-4">
        <legend className="mb-2 font-[var(--font-display)] text-[21px] font-semibold">
          2 · Date &amp; time
        </legend>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => {
            const label = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
            const key = dateKey(d);
            const on = day === key;
            return (
              <button
                type="button"
                key={key}
                onClick={() => { setDay(key); setSlot(null); setLoadingSlots(true); }}
                className={`shrink-0 rounded-lg border px-4 py-3 text-[14px] font-medium transition-colors ${
                  on ? "border-[var(--ink)] bg-[var(--accent)]/15" : "border-[var(--line)] hover:border-[var(--ink)]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {slots.map((s) => {
            const off = loadingSlots || unavailable.has(s);
            const on = slot === s;
            return (
              <button
                type="button"
                key={s}
                disabled={off || !day}
                onClick={() => setSlot(s)}
                className={`tabular rounded-lg border px-4 py-2.5 text-[14.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                  on ? "border-[var(--ink)] bg-[var(--accent)]/15" : "border-[var(--line)] hover:border-[var(--ink)]"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
        <p className="text-[13.5px] text-[var(--ink-3)]">
          {day ? "All times are IST. The clinic will confirm your request directly." : "Pick a date to see available times."}
        </p>
      </fieldset>

      {/* step 3 */}
      <fieldset className="grid gap-5">
        <legend className="mb-2 font-[var(--font-display)] text-[21px] font-semibold">
          3 · Your details
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid content-start gap-2">
            <label htmlFor={errors.inputProps("name").id} className={labelCls}>Name</label>
            <input required type="text" autoComplete="name" maxLength={120} value={details.name} onChange={(e) => set("name", e.target.value)} className={fieldCls} {...errors.inputProps("name")} />
            <FieldError id={errors.errorIdFor("name")} message={errors.fields.name} />
          </div>
          <div className="grid content-start gap-2">
            <label htmlFor={errors.inputProps("phone").id} className={labelCls}>Phone</label>
            <input required type="tel" autoComplete="tel" inputMode="tel" maxLength={24} value={details.phone} onChange={(e) => set("phone", e.target.value)} className={fieldCls} {...errors.inputProps("phone")} />
            <FieldError id={errors.errorIdFor("phone")} message={errors.fields.phone} />
          </div>
          <div className="grid content-start gap-2">
            <label htmlFor={errors.inputProps("email").id} className={labelCls}>Email</label>
            <input required type="email" autoComplete="email" maxLength={200} value={details.email} onChange={(e) => set("email", e.target.value)} className={fieldCls} {...errors.inputProps("email")} />
            <FieldError id={errors.errorIdFor("email")} message={errors.fields.email} />
          </div>
        </div>
        <div className="grid gap-2">
          <label htmlFor={errors.inputProps("reason").id} className={labelCls}>Main reason for consultation</label>
          <select required value={details.reason} onChange={(e) => set("reason", e.target.value)} className={fieldCls} {...errors.inputProps("reason")}>
            <option value="" disabled>Choose one</option>
            <option>Weight loss</option>
            <option>Weight gain</option>
            <option>Diabetes or blood sugar</option>
            <option>PCOS / PCOD</option>
            <option>Thyroid</option>
            <option>Cholesterol</option>
            <option>Digestive health</option>
            <option>Fitness or muscle</option>
            <option>General wellness</option>
            <option>Not sure yet</option>
          </select>
          <FieldError id={errors.errorIdFor("reason")} message={errors.fields.reason} />
        </div>
        <div className="grid gap-2">
          <label htmlFor={errors.inputProps("notes").id} className={labelCls}>Anything we should know before we meet? <span className="font-normal normal-case tracking-normal">(optional)</span></label>
          <textarea rows={4} maxLength={2000} value={details.notes} onChange={(e) => set("notes", e.target.value)} className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 text-[16px] leading-relaxed aria-[invalid=true]:border-[var(--alert)]" {...errors.inputProps("notes")} />
          <FieldError id={errors.errorIdFor("notes")} message={errors.fields.notes} />
        </div>
      </fieldset>

      {/* consent */}
      <fieldset className="grid gap-4">
        <legend className="mb-2 font-[var(--font-display)] text-[21px] font-semibold">4 · Confirm</legend>
        <label className="flex items-start gap-3 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          <input type="checkbox" required checked={terms} onChange={(e) => { setTerms(e.target.checked); errors.clear("acceptTerms"); }} className="mt-1 h-4 w-4 shrink-0" {...errors.inputProps("acceptTerms")} />
          <span>
            I&rsquo;ve read and accept the <Link href="/terms" className="underline">Terms of Service</Link> and{" "}
            <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
          </span>
        </label>
        <label className="flex items-start gap-3 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          <input type="checkbox" required checked={disclaimer} onChange={(e) => { setDisclaimer(e.target.checked); errors.clear("acceptDisclaimer"); }} className="mt-1 h-4 w-4 shrink-0" {...errors.inputProps("acceptDisclaimer")} />
          <span>
            I understand that Ozmo provides nutrition and lifestyle guidance and does not diagnose or
            treat medical conditions.{" "}
            <Link href="/medical-disclaimer" className="underline">Read our medical disclaimer</Link>.
          </span>
        </label>
        <FieldError id={errors.errorIdFor("acceptTerms")} message={errors.fields.acceptTerms} />
        <FieldError id={errors.errorIdFor("acceptDisclaimer")} message={errors.fields.acceptDisclaimer} />
        {error && (
          <p role="alert" className="rounded-xl border border-[var(--alert)]/30 bg-[var(--alert)]/6 px-4 py-3 text-[14.5px] text-[var(--ink-2)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!day || !slot || busy}
          className="mt-2 inline-flex min-h-[52px] w-fit items-center rounded-lg bg-[var(--ink)] px-7 text-[16px] font-semibold text-white transition-colors hover:bg-[#163B4D] disabled:cursor-not-allowed disabled:opacity-35"
        >
          {busy ? "Confirming…" : "Confirm booking →"}
        </button>
        <p className="text-[13.5px] text-[var(--ink-3)]">
          Payment is completed at the clinic for now. Online payment is coming shortly.
        </p>
      </fieldset>
    </form>
  );
}
