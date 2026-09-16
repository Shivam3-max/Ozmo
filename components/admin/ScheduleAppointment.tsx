"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, field, FormError } from "./form";
import { emailedText } from "./EmailedNote";

/** Today's date in India, for the date picker's minimum. */
const istToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

export default function ScheduleAppointment({
  clientId,
  leadId,
  defaultType,
  followUps,
}: {
  clientId?: string;
  leadId?: string;
  defaultType: "INITIAL" | "FOLLOW_UP";
  followUps?: { used: number; included: number } | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ type: defaultType, mode: "IN_CLINIC", date: "", time: "10:00", durationMin: "30", meetingUrl: "", reason: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  if (!open) {
    return (
      <div className="grid gap-2">
        {saved && <p role="status" className="text-[13.5px] text-[var(--good)]">{saved}</p>}
        <button
          type="button"
          onClick={() => { setOpen(true); setSaved(null); }}
          className="w-fit rounded-full bg-[var(--ink)] px-4 py-2 text-[13.5px] font-semibold text-white"
        >
          Schedule {defaultType === "FOLLOW_UP" ? "a follow-up" : "a consultation"}
        </button>
      </div>
    );
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true); setError(null);
        try {
          const res = await fetch("/api/admin/appointments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...f, clientId, leadId, meetingUrl: f.mode === "VIDEO" ? f.meetingUrl : "" }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) { setError(data?.error ?? "Couldn't schedule that."); setBusy(false); return; }
          setSaved(`Scheduled for ${f.date} at ${f.time} (IST). ${emailedText(data.emailed, "the details") ?? ""}`.trim());
          setOpen(false);
          setF((p) => ({ ...p, date: "", reason: "", meetingUrl: "" }));
          router.refresh();
        } catch {
          setError("Couldn't reach the server.");
        }
        setBusy(false);
      }}
    >
      {followUps && f.type === "FOLLOW_UP" && (
        <p className="text-[13px] text-[var(--ink-2)]">
          {followUps.used} of {followUps.included} follow-ups used. It&rsquo;s counted when you mark the appointment completed.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Date" required><input required type="date" min={istToday()} className={field} value={f.date} onChange={(e) => set("date", e.target.value)} /></Field>
        <Field label="Time (IST)" required><input required type="time" step={900} className={field} value={f.time} onChange={(e) => set("time", e.target.value)} /></Field>
        <Field label="Type" required>
          <select className={field} value={f.type} onChange={(e) => set("type", e.target.value as typeof f.type)}>
            <option value="FOLLOW_UP">Follow-up</option>
            <option value="INITIAL">Initial consultation</option>
          </select>
        </Field>
        <Field label="Length" required>
          <select className={field} value={f.durationMin} onChange={(e) => set("durationMin", e.target.value)}>
            {["15", "30", "45", "60", "90"].map((m) => <option key={m} value={m}>{m} minutes</option>)}
          </select>
        </Field>
        <Field label="Where" required>
          <select className={field} value={f.mode} onChange={(e) => set("mode", e.target.value)}>
            <option value="IN_CLINIC">At the clinic</option>
            <option value="VIDEO">Video call</option>
          </select>
        </Field>
        {f.mode === "VIDEO" && (
          <Field label="Video link" hint="Shown to the client as a Join button. You can add it later.">
            <input type="url" inputMode="url" placeholder="https://" className={field} value={f.meetingUrl} onChange={(e) => set("meetingUrl", e.target.value)} />
          </Field>
        )}
        <Field label="What it's for" span>
          <input className={field} maxLength={500} placeholder="e.g. fortnightly review, plan revision" value={f.reason} onChange={(e) => set("reason", e.target.value)} />
        </Field>
      </div>
      <FormError message={error} />
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-50">
          {busy ? "Scheduling…" : "Schedule"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2.5 text-[14px] text-[var(--ink-3)]">Cancel</button>
      </div>
    </form>
  );
}

/** Add or change the join link on an upcoming video appointment. */
export function MeetingLink({ appointmentId, initial }: { appointmentId: string; initial: string | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  if (!editing) {
    return (
      <span className="grid gap-1">
        <button type="button" onClick={() => { setEditing(true); setNote(null); }} className="w-fit text-[12.5px] font-semibold text-[var(--accent-text)] underline">
          {initial ? "Change video link" : "Add video link"}
        </button>
        {note && <span role="status" className="text-[12px] text-[var(--ink-2)]">{note}</span>}
      </span>
    );
  }
  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true); setError(null);
        try {
          const res = await fetch(`/api/admin/appointments/${appointmentId}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ meetingUrl: value }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) setError(data?.error ?? "Couldn't save the link.");
          else { setEditing(false); setNote(value ? emailedText(data.emailed, "the link") : null); router.refresh(); }
        } catch {
          setError("Couldn't reach the server.");
        }
        setBusy(false);
      }}
    >
      <input type="url" aria-label="Video link" placeholder="https://" value={value} onChange={(e) => setValue(e.target.value)} className="min-h-[34px] w-[220px] rounded-lg border border-[var(--line)] px-2 text-[13px]" />
      <button type="submit" disabled={busy} className="rounded-full bg-[var(--ink)] px-3 py-1.5 text-[12.5px] font-semibold text-white">Save</button>
      {error && <span role="alert" className="w-full text-[12px] text-[var(--alert)]">{error}</span>}
    </form>
  );
}
