"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** One-click verification straight from the list — the bulk task, made cheap. */
export default function VerifyToggle({ id, verified }: { id: string; verified: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(verified);
  const [busy, setBusy] = useState(false);

  return (
    <button
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (busy) return;
        setBusy(true);
        const next = !on;
        setOn(next); // optimistic — reverted below if the server disagrees
        try {
          const res = await fetch(`/api/admin/foods/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isVerified: next, _mode: "verify" }),
          });
          if (!res.ok) setOn(!next);
          else router.refresh();
        } catch {
          setOn(!next);
        }
        setBusy(false);
      }}
      title={on ? "Verified — click to unverify" : "Mark as verified"}
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
        on
          ? "border-[var(--good)] bg-[var(--good)] text-white"
          : "border-[var(--line)] text-transparent hover:border-[var(--good)]"
      } ${busy ? "opacity-50" : ""}`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </button>
  );
}
