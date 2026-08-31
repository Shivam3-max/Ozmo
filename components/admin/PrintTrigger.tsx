"use client";

import { useEffect } from "react";

/**
 * Print styling plus a one-shot print dialog. Printing to PDF from the browser
 * gives her a clean document without pulling a PDF engine into the server —
 * and the output is the same page she can check on screen first.
 */
export default function PrintTrigger() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @page { size: A4; margin: 14mm 12mm; }
        @media print {
          body { background: #fff !important; }
          .plan-print { padding: 0 !important; max-width: none !important; }
          header, nav, aside, .no-print { display: none !important; }
          .plan-print header { display: flex !important; }
        }
      `}</style>
      <div className="no-print mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--tint)] px-5 py-3.5 print:hidden">
        <p className="text-[14px] text-[var(--ink-2)]">
          Your browser&rsquo;s print dialog should open. Choose <strong>Save as PDF</strong> to send it to the client.
        </p>
        <button
          onClick={() => window.print()}
          className="ml-auto rounded-full bg-[var(--ink)] px-4 py-2 text-[13.5px] font-semibold text-white"
        >
          Print again
        </button>
      </div>
    </>
  );
}
