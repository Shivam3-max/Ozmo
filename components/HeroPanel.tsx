const meals = [
  { time: "8:30", name: "Vegetable poha + curd", state: "done" },
  { time: "11:00", name: "Guava · 5 almonds", state: "done" },
  { time: "13:30", name: "2 roti · dal · sabzi · salad", state: "now" },
  { time: "17:00", name: "Roasted chana · green tea", state: "next" },
  { time: "20:00", name: "1 roti · paneer · sabzi", state: "next" },
];

const feed = [
  { text: "Priya logged lunch — 4-day streak", when: "just now" },
  { text: "Plan revised for Rahul · dinner moved to 8:00", when: "6m ago" },
];

const stats = [
  { label: "Ozmo Score", value: "78", delta: "↑ 6", good: true },
  { label: "Adherence", value: "82%", delta: "this week", good: false },
  { label: "Weight", value: "78.4", delta: "↓ 3.6 kg", good: true },
];

export default function HeroPanel() {
  return (
    <div className="relative">
      {/* corner cards hang off the panel edges — never over its content */}
      <div className="absolute -left-5 -top-7 z-20 hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-5 py-3.5 shadow-[0_16px_38px_rgba(15,46,61,0.15)] lg:block">
        <div className="flex items-center gap-3">
          <span className="live-dot h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden />
          <span className="text-[13px] font-semibold">12-day streak</span>
        </div>
      </div>

      <div className="absolute -bottom-8 -right-5 z-20 hidden items-center gap-3.5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-5 py-3.5 shadow-[0_16px_38px_rgba(15,46,61,0.15)] lg:flex">
        <div className="flex items-end gap-1" aria-hidden>
          {[1, 0.86, 1, 0.55, 0.92, 0.4, 0.24].map((v, i) => (
            <span
              key={i}
              className="w-[6px] rounded-sm bg-[var(--accent)]"
              style={{ height: 26 * v, opacity: 0.4 + v * 0.6 }}
            />
          ))}
        </div>
        <span className="text-[13px] font-semibold leading-tight">
          82% <span className="font-normal text-[var(--ink-3)]">this week</span>
        </span>
      </div>

      {/* main panel */}
      <div className="relative z-10 overflow-hidden rounded-[26px] border border-[var(--line)] bg-[var(--paper)] shadow-[0_28px_70px_rgba(15,46,61,0.13)]">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="live-dot h-2 w-2 rounded-full bg-[var(--good)]" aria-hidden />
            <span className="text-[14.5px] font-semibold">Today&rsquo;s plan · Priya</span>
          </div>
          <span className="tabular rounded-full bg-[var(--tint)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">
            Day 34 / 90
          </span>
        </div>

        {/* stat strip */}
        <div className="grid grid-cols-3 gap-px border-b border-[var(--line)] bg-[var(--line-soft)]">
          {stats.map((s) => (
            <div key={s.label} className="bg-[var(--paper)] px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
                {s.label}
              </p>
              <p className="tabular mt-1.5 font-[var(--font-display)] text-[26px] font-bold leading-none">
                {s.value}
              </p>
              <p className={`mt-1.5 text-[12px] font-semibold ${s.good ? "text-[var(--good)]" : "text-[var(--ink-3)]"}`}>
                {s.delta}
              </p>
            </div>
          ))}
        </div>

        <ul className="grid gap-1.5 px-5 py-5">
          {meals.map((m) => (
            <li
              key={m.time}
              className={`flex items-center gap-3.5 rounded-xl border px-4 py-3 ${
                m.state === "now" ? "border-[var(--ink)]/20 bg-[var(--accent)]/12" : "border-transparent"
              }`}
            >
              <span className="tabular w-[40px] shrink-0 text-[13px] font-semibold text-[var(--ink-3)]">
                {m.time}
              </span>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  m.state === "done"
                    ? "border-[var(--good)] bg-[var(--good)] text-white"
                    : m.state === "now"
                    ? "border-[var(--ink)]"
                    : "border-[var(--line)]"
                }`}
                aria-hidden
              >
                {m.state === "done" && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </span>
              <span className={`text-[14.5px] leading-snug ${m.state === "done" ? "text-[var(--ink-3)]" : "font-medium"}`}>
                {m.name}
              </span>
              {m.state === "now" && (
                <span className="ml-auto shrink-0 rounded-full bg-[var(--accent)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.07em] text-[#0F2E3D]">
                  Up next
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className="border-t border-[var(--line)] bg-[var(--tint)] px-6 py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
              Live in the clinic
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-[var(--paper)] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--good)]">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-[var(--good)]" aria-hidden />
              Live
            </span>
          </div>
          <ul className="grid gap-2.5">
            {feed.map((f, i) => (
              <li key={f.text} className="flex items-baseline gap-3" style={{ opacity: 1 - i * 0.22 }}>
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ink-3)]" aria-hidden />
                <span className="text-[13.5px] leading-snug text-[var(--ink-2)]">{f.text}</span>
                <span className="tabular ml-auto shrink-0 text-[12px] text-[var(--ink-3)]">{f.when}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
