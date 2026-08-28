"use client";

import Link from "next/link";
import { useState } from "react";

const types = [
  { id: "clinic", name: "In-clinic consultation", desc: "At our clinic — the full works, with measurements taken in person." },
  { id: "video", name: "Online video consultation", desc: "From wherever you are. Same programme, same plan, same dashboard." },
  { id: "followup", name: "Follow-up consultation", desc: "For existing clients. Log in to use the follow-ups included in your programme." },
];

const slots = ["10:00", "10:45", "11:30", "12:15", "15:00", "15:45", "16:30", "17:15", "18:00"];
const unavailable = new Set(["11:30", "15:45", "18:00"]);

const labelCls = "text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]";
const fieldCls = "min-h-[50px] rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 text-[16px]";

function nextDays(n: number) {
  const out: Date[] = [];
  const d = new Date();
  while (out.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) out.push(new Date(d));
  }
  return out;
}

type Details = { name: string; phone: string; email: string; age: string; reason: string; notes: string };

export default function BookingForm() {
  const [type, setType] = useState("clinic");
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<Details>({ name: "", phone: "", email: "", age: "", reason: "", notes: "" });
  const [terms, setTerms] = useState(false);
  const [disclaimer, setDisclaimer] = useState(false);
  const days = nextDays(8);

  const set = <K extends keyof Details>(k: K, v: Details[K]) => setDetails((d) => ({ ...d, [k]: v }));

  if (confirmed) {
    return (
      <div className="max-w-[640px] rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-8">
        <h2 className="text-[28px]">You&rsquo;re booked.</h2>
        <dl className="mt-6 grid gap-3 border-y border-[var(--line)] py-5 text-[15.5px]">
          {[
            ["Type", types.find((t) => t.id === type)!.name],
            ["Date", day ?? "—"],
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
          <li>A confirmation is on its way to your WhatsApp and email.</li>
          <li>If you&rsquo;re consulting online, your video link arrives 30 minutes before.</li>
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
        setBusy(true);
        setError(null);
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
            setError(data?.error ?? "We couldn't confirm that booking. Please try again.");
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
            const on = day === label;
            return (
              <button
                type="button"
                key={label}
                onClick={() => setDay(label)}
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
            const off = unavailable.has(s);
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
          {day ? "All times are IST. You'll get a confirmation on WhatsApp and email." : "Pick a date to see available times."}
        </p>
      </fieldset>

      {/* step 3 */}
      <fieldset className="grid gap-5">
        <legend className="mb-2 font-[var(--font-display)] text-[21px] font-semibold">
          3 · Your details
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2"><span className={labelCls}>Name</span><input required type="text" value={details.name} onChange={(e) => set("name", e.target.value)} className={fieldCls} /></label>
          <label className="grid gap-2"><span className={labelCls}>Phone</span><input required type="tel" value={details.phone} onChange={(e) => set("phone", e.target.value)} className={fieldCls} /></label>
          <label className="grid gap-2"><span className={labelCls}>Email</span><input required type="email" value={details.email} onChange={(e) => set("email", e.target.value)} className={fieldCls} /></label>
          <label className="grid gap-2"><span className={labelCls}>Age</span><input required type="number" min={13} max={100} value={details.age} onChange={(e) => set("age", e.target.value)} className={fieldCls} /></label>
        </div>
        <label className="grid gap-2">
          <span className={labelCls}>Main reason for consultation</span>
          <select required value={details.reason} onChange={(e) => set("reason", e.target.value)} className={fieldCls}>
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
        </label>
        <label className="grid gap-2">
          <span className={labelCls}>Anything we should know before we meet? <span className="font-normal normal-case tracking-normal">(optional)</span></span>
          <textarea rows={4} value={details.notes} onChange={(e) => set("notes", e.target.value)} className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 text-[16px] leading-relaxed" />
        </label>
      </fieldset>

      {/* consent */}
      <fieldset className="grid gap-4">
        <legend className="mb-2 font-[var(--font-display)] text-[21px] font-semibold">4 · Confirm</legend>
        <label className="flex items-start gap-3 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          <input type="checkbox" required checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 h-4 w-4 shrink-0" />
          <span>
            I&rsquo;ve read and accept the <Link href="/terms" className="underline">Terms of Service</Link> and{" "}
            <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
          </span>
        </label>
        <label className="flex items-start gap-3 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          <input type="checkbox" required checked={disclaimer} onChange={(e) => setDisclaimer(e.target.checked)} className="mt-1 h-4 w-4 shrink-0" />
          <span>
            I understand that Ozmo provides nutrition and lifestyle guidance and does not diagnose or
            treat medical conditions.{" "}
            <Link href="/medical-disclaimer" className="underline">Read our medical disclaimer</Link>.
          </span>
        </label>
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
