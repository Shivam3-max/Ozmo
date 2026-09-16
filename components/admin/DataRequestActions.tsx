"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Status = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";

export default function DataRequestActions({ id, status }: { id: string; status: Status }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function update(nextStatus: Status) {
    let resolution: string | undefined;
    if (nextStatus === "COMPLETED" || nextStatus === "REJECTED") {
      const answer = window.prompt(
        nextStatus === "COMPLETED"
          ? "Record what was deleted or retained, and why:"
          : "Record why this request was rejected:"
      );
      if (answer === null) return;
      resolution = answer.trim();
      if (!resolution) {
        setError("A resolution note is required when closing a request.");
        return;
      }
    }

    setBusy(true);
    setError("");
    const response = await fetch(`/api/admin/data-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, resolution }),
    });
    const body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setError(body.error ?? "Could not update this request.");
      return;
    }
    router.refresh();
  }

  if (status === "COMPLETED" || status === "REJECTED") return null;

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        {status === "OPEN" && (
          <button
            disabled={busy}
            onClick={() => update("IN_PROGRESS")}
            className="rounded-full border border-[var(--line)] px-3 py-1.5 text-[12.5px] font-semibold disabled:opacity-50"
          >
            Start review
          </button>
        )}
        <button
          disabled={busy}
          onClick={() => update("COMPLETED")}
          className="rounded-full bg-[var(--good)] px-3 py-1.5 text-[12.5px] font-semibold text-white disabled:opacity-50"
        >
          Complete
        </button>
        <button
          disabled={busy}
          onClick={() => update("REJECTED")}
          className="rounded-full border border-[var(--alert)]/40 px-3 py-1.5 text-[12.5px] font-semibold text-[var(--alert)] disabled:opacity-50"
        >
          Reject
        </button>
      </div>
      {error && <p className="mt-2 text-[12.5px] text-[var(--alert)]">{error}</p>}
    </div>
  );
}
