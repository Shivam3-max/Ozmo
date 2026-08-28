const tiles = [
  { label: "Weight", value: "78.4", unit: "kg", delta: "↓ 3.6 kg since start", good: true },
  { label: "Ozmo Score", value: "78", unit: "/100", delta: "↑ 6 this week", good: true },
  { label: "Today", value: "3/6", unit: "", delta: "meals logged", good: false },
  { label: "Water", value: "5/8", unit: "", delta: "glasses", good: false },
];

const week = [
  { d: "M", v: 1 },
  { d: "T", v: 0.85 },
  { d: "W", v: 1 },
  { d: "T", v: 0.55 },
  { d: "F", v: 0.9 },
  { d: "S", v: 0.35 },
  { d: "S", v: 0.18 },
];

export default function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)] shadow-[0_1px_2px_rgba(15,46,61,.05),0_18px_40px_rgba(15,46,61,.07)]">
      <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--tint)] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--line)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--line)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--line)]" />
        <span className="ml-2 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-3)]">
          Your dashboard
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <p className="font-[var(--font-display)] text-[21px] font-semibold">Good morning, Priya</p>
        <p className="mt-1 text-[13.5px] text-[var(--ink-3)]">Thursday, 4 September · Day 34 of 90</p>

        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--line-soft)] bg-[var(--line-soft)] sm:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="bg-[var(--paper)] px-3.5 py-3">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">
                {t.label}
              </p>
              <p className="tabular mt-1.5 text-[23px] font-semibold leading-none tracking-tight">
                {t.value}
                <span className="ml-0.5 text-[13px] font-normal text-[var(--ink-3)]">{t.unit}</span>
              </p>
              <p className={`mt-1 text-[12px] font-semibold ${t.good ? "text-[var(--good)]" : "text-[var(--ink-3)]"}`}>
                {t.delta}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-[var(--line)] p-4">
          <div className="flex items-center justify-between text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">
            <span>Up next · Lunch</span>
            <span className="tabular">1:30 PM</span>
          </div>
          <ul className="mt-3 grid gap-1 text-[14.5px]">
            <li>Salad — 1 bowl</li>
            <li>Multigrain roti — 2</li>
            <li>Dal — 1 katori</li>
            <li>Bhindi sabzi — 1 katori</li>
            <li>Curd — 1 small bowl</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[13px] font-semibold text-[#0F2E3D]">
              Mark as eaten
            </span>
            <span className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-[13px] text-[var(--ink-2)]">
              Swap
            </span>
            <span className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-[13px] text-[var(--ink-2)]">
              I ate something else
            </span>
          </div>
        </div>

        <p className="mt-5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">
          This week — 82% adherence · 12-day streak
        </p>
        <div className="mt-2.5 flex gap-1.5">
          {week.map((w, i) => (
            <div key={i} className="flex-1">
              <div
                className="h-8 rounded bg-[var(--accent)]"
                style={{ opacity: w.v }}
                aria-hidden
              />
              <p className="mt-1 text-center text-[10px] text-[var(--ink-3)]">{w.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
