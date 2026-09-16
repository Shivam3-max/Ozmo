"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { ACCEPT_ATTRIBUTE, DOCUMENT_LABEL, MAX_DOCUMENT_BYTES, MAX_DOCUMENT_MB, type DocumentTypeValue } from "@/lib/documents/files";

/** Upload form for a PDF or photo, used in the client file and in the portal. */
export default function UploadDocument({
  endpoint,
  types,
  askVisibility = false,
  submitLabel = "Upload",
}: {
  endpoint: string;
  types: readonly DocumentTypeValue[];
  askVisibility?: boolean;
  submitLabel?: string;
}) {
  const router = useRouter();
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DocumentTypeValue>(types[0]);
  const [visible, setVisible] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const label = "text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]";
  const control = "min-h-[40px] w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 text-[14px]";

  return (
    <form
      className="grid gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        const file = input.current?.files?.[0];
        setError(null); setDone(null);
        if (!file) return setError("Choose a file to upload.");
        if (file.size > MAX_DOCUMENT_BYTES) return setError(`That file is larger than ${MAX_DOCUMENT_MB} MB. Try a smaller scan or a PDF export.`);

        const body = new FormData();
        body.set("file", file);
        body.set("title", title || file.name.replace(/\.[a-z0-9]+$/i, ""));
        body.set("type", type);
        if (askVisibility) body.set("visibleToClient", String(visible));

        setBusy(true);
        try {
          const res = await fetch(endpoint, { method: "POST", body });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) setError(data?.error ?? (res.status === 413 ? `Files can be up to ${MAX_DOCUMENT_MB} MB.` : "Couldn't upload that file."));
          else {
            setDone("Uploaded.");
            setTitle("");
            if (input.current) input.current.value = "";
            router.refresh();
          }
        } catch {
          setError("Couldn't reach the server.");
        }
        setBusy(false);
      }}
    >
      <div className="grid gap-1.5">
        <label htmlFor={`${id}-file`} className={label}>File</label>
        <input id={`${id}-file`} ref={input} type="file" accept={ACCEPT_ATTRIBUTE} aria-describedby={`${id}-hint`} className="text-[13.5px]" />
        <span id={`${id}-hint`} className="text-[12.5px] text-[var(--ink-3)]">PDF, JPEG or PNG, up to {MAX_DOCUMENT_MB} MB. Stored encrypted.</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-title`} className={label}>Name <span className="font-normal normal-case tracking-normal">(optional)</span></label>
          <input id={`${id}-title`} className={control} maxLength={120} value={title} placeholder="e.g. Blood test, March" onChange={(e) => setTitle(e.target.value)} />
        </div>
        {types.length > 1 && (
          <div className="grid gap-1.5">
            <label htmlFor={`${id}-type`} className={label}>Kind</label>
            <select id={`${id}-type`} className={control} value={type} onChange={(e) => setType(e.target.value as DocumentTypeValue)}>
              {types.map((t) => <option key={t} value={t}>{DOCUMENT_LABEL[t]}</option>)}
            </select>
          </div>
        )}
      </div>
      {askVisibility && (
        <label className="flex items-start gap-2 text-[13.5px] text-[var(--ink-2)]">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="mt-1" />
          Show in the client&rsquo;s portal
        </label>
      )}
      {error && <p role="alert" className="text-[13px] text-[var(--alert)]">{error}</p>}
      {done && <p role="status" className="text-[13px] text-[var(--good)]">{done}</p>}
      <button type="submit" disabled={busy} className="w-fit rounded-full bg-[var(--ink)] px-4 py-2 text-[13.5px] font-semibold text-white disabled:opacity-50">
        {busy ? "Uploading…" : submitLabel}
      </button>
    </form>
  );
}
