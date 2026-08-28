"use client";

import { useState } from "react";

export default function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)] divide-y divide-[var(--line)]">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              className="flex w-full items-start justify-between gap-6 px-6 py-6 text-left transition-colors hover:bg-[var(--tint)]"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="text-[17.5px] font-semibold leading-snug">{item.q}</span>
              <span
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[#0F2E3D] transition-transform duration-200"
                style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
                aria-hidden
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
            {isOpen && (
              <p className="-mt-1 px-6 pb-7 pr-16 text-[16.5px] leading-relaxed text-[var(--ink-2)]">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
