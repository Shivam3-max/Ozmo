"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import EmailedNote, { type Emailed } from "./EmailedNote";

export function NewReportButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="grid gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true); setError(null);
          try {
            const res = await fetch(`/api/admin/clients/${clientId}/reports`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) { setError(data?.error ?? "Couldn't start a report."); setBusy(false); return; }
            router.push(`/admin/clients/${clientId}/reports/${data.id}`);
          } catch {
            setError("Couldn't reach the server.");
            setBusy(false);
          }
        }}
        className="w-fit rounded-full border border-[var(--line)] bg-[var(--paper)] px-3.5 py-1.5 text-[13px] font-semibold hover:border-[var(--ink)] disabled:opacity-50"
      >
        {busy ? "Drafting…" : "Draft last 30 days"}
      </button>
      {error && <span role="alert" className="text-[12.5px] text-[var(--alert)]">{error}</span>}
    </div>
  );
}

export default function ReportEditor({
  id,
  clientId,
  status,
  initial,
}: {
  id: string;
  clientId: string;
  status: "DRAFT" | "APPROVED" | "SENT";
  initial: { observations: string; nextMonthFocus: string };
}) {
  const router = useRouter();
  const uid = useId();
  const [text, setText] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [emailed, setEmailed] = useState<Emailed>(null);

  const call = async (label: string, body: Record<string, unknown>, method = "PATCH") => {
    setBusy(label); setError(null); setSaved(null);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method, headers: { "Content-Type": "application/json" }, body: method === "DELETE" ? undefined : JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.error ?? "Couldn't save the report."); setBusy(null); return false; }
      setBusy(null);
      return data as { emailed?: Emailed };
    } catch {
      setError("Couldn't reach the server.");
      setBusy(null);
      return false;
    }
  };

  const save = async (refresh = false) => {
    const ok = await call(refresh ? "refresh" : "save", { action: "save", ...text, refresh });
    if (ok) { setDirty(false); setSaved(refresh ? "Figures refreshed and saved." : "Saved."); router.refresh(); }
    return ok;
  };

  const locked = status === "SENT";
  const label = "text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]";
  const area = "w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-[14.5px] leading-relaxed focus:border-[var(--ink)] focus:outline-none disabled:bg-[var(--tint)]";
  const primary = "rounded-full bg-[var(--ink)] px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-50";
  const secondary = "rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-[14px] font-semibold hover:border-[var(--ink)] disabled:opacity-50";

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <label htmlFor={`${uid}-obs`} className={label}>Observations</label>
        <textarea
          id={`${uid}-obs`} rows={7} maxLength={5000} disabled={locked} className={area}
          placeholder="What went well, what the numbers say, anything you noticed in their logs or messages."
          value={text.observations}
          onChange={(e) => { setText({ ...text, observations: e.target.value }); setDirty(true); }}
        />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor={`${uid}-focus`} className={label}>Focus for next month</label>
        <textarea
          id={`${uid}-focus`} rows={4} maxLength={3000} disabled={locked} className={area}
          placeholder="Two or three concrete things to work on."
          value={text.nextMonthFocus}
          onChange={(e) => { setText({ ...text, nextMonthFocus: e.target.value }); setDirty(true); }}
        />
      </div>

      {error && <p role="alert" className="text-[13.5px] text-[var(--alert)]">{error}</p>}
      <p role="status" aria-live="polite" className="min-h-[1.2em] text-[13px] text-[var(--ink-2)]">{saved ?? (dirty ? "Unsaved changes" : "")}</p>
      <EmailedNote status={emailed} what="the report link to the client" />

      {!locked && (
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={Boolean(busy)} className={secondary} onClick={() => save()}>
            {busy === "save" ? "Saving…" : "Save draft"}
          </button>
          <button type="button" disabled={Boolean(busy)} className={secondary} onClick={() => save(true)}>
            {busy === "refresh" ? "Refreshing…" : "Refresh figures"}
          </button>
          {status === "DRAFT" && (
            <button
              type="button" disabled={Boolean(busy)} className={primary}
              onClick={async () => {
                if (dirty && !(await save())) return;
                if (await call("approve", { action: "approve" })) { setSaved("Approved. Share it when you're ready."); router.refresh(); }
              }}
            >
              {busy === "approve" ? "Approving…" : "Approve"}
            </button>
          )}
          {status === "APPROVED" && (
            <button
              type="button" disabled={Boolean(busy) || dirty} className={primary}
              title={dirty ? "Save first — editing sends the report back to draft." : undefined}
              onClick={async () => {
                if (!confirm("Share this report with the client? It appears in their portal and can't be changed afterwards.")) return;
                const result = await call("send", { action: "send" });
                if (result) { setEmailed(result.emailed ?? null); setSaved("Shared with the client."); router.refresh(); }
              }}
            >
              {busy === "send" ? "Sharing…" : "Share with client"}
            </button>
          )}
          <button
            type="button" disabled={Boolean(busy)} className="rounded-full px-3 py-2.5 text-[13.5px] text-[var(--alert)]"
            onClick={async () => {
              if (!confirm("Discard this report?")) return;
              if (await call("discard", {}, "DELETE")) router.push(`/admin/clients/${clientId}`);
            }}
          >
            Discard
          </button>
        </div>
      )}
      {status === "APPROVED" && !locked && (
        <p className="text-[12.5px] text-[var(--ink-3)]">Editing an approved report sends it back to draft for another look.</p>
      )}
    </div>
  );
}
