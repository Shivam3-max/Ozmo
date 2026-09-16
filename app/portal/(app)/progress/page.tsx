import { prisma } from "@/lib/db";
import { currentClient, ozmoScore, currentStreak, BAND_COPY } from "@/lib/portal";
import { addDays, clinicDay, dayKey } from "@/lib/clinic-time";
import WeightChart from "@/components/portal/WeightChart";

export const dynamic = "force-dynamic";

const MILESTONES = [7, 14, 30, 60, 90, 180];

export default async function ProgressPage() {
  const client = await currentClient();
  if (!client) return null;

  const today = clinicDay();
  const since = addDays(today, -83);
  const [score, streak, measurements, logs] = await Promise.all([
    ozmoScore(client.id, client.enrollments[0]?.startDate ?? client.joinedAt),
    currentStreak(client.id),
    prisma.measurement.findMany({ where: { clientId: client.id, weightKg: { not: null } }, orderBy: { date: "asc" }, take: 200 }),
    prisma.foodLog.findMany({ where: { clientId: client.id, date: { gte: since } }, select: { date: true } }),
  ]);

  const weights = measurements.map((m) => ({ date: m.date, weight: m.weightKg! }));
  const loggedDays = new Set(logs.map((l) => dayKey(l.date)));

  // 12 weeks of activity, oldest first
  const cells = Array.from({ length: 84 }, (_, i) => {
    const d = addDays(since, i);
    return { key: dayKey(d), on: loggedDays.has(dayKey(d)) };
  });

  const bandTone =
    score.band === "Excellent" || score.band === "On track" ? "var(--good)" : "var(--watch)";

  return (
    <>
      <h1 className="font-[var(--font-display)] text-[clamp(24px,4vw,30px)] font-bold tracking-[-0.02em]">Progress</h1>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">Your Ozmo Score</p>
          <p className="tabular mt-3 font-[var(--font-display)] text-[64px] font-bold leading-none" style={{ color: bandTone }}>
            {score.score}
          </p>
          <p className="mt-1 text-[14px] font-semibold" style={{ color: bandTone }}>{score.band}</p>
          <p className="mx-auto mt-4 max-w-[34ch] text-[14px] leading-relaxed text-[var(--ink-2)]">
            {BAND_COPY[score.band]}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
          <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">How it&rsquo;s made up</p>
          <p className="mt-1.5 text-[13.5px] text-[var(--ink-3)]">
            {score.days < 7 ? `Your first ${score.days} ${score.days === 1 ? "day" : "days"} — it grows to a rolling 7.` : "Rolling 7 days."} No hidden maths.
          </p>
          <div className="mt-4 grid gap-3.5">
            {score.parts.map((p) => (
              <div key={p.label}>
                <div className="flex items-baseline justify-between text-[14px]">
                  <span className="font-medium">{p.label}</span>
                  <span className="tabular text-[var(--ink-3)]">
                    {Math.round(p.earned * p.weight)} / {p.weight}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--line-soft)]">
                  <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.round(p.earned * 100)}%` }} />
                </div>
                <p className="mt-1 text-[12.5px] text-[var(--ink-3)]">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">Streak</p>
          <p className="tabular text-[14px] font-semibold">
            {streak.current} {streak.current === 1 ? "day" : "days"}
            {streak.graceUsed && <span className="ml-2 font-normal text-[var(--ink-3)]">· one day forgiven</span>}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {MILESTONES.map((m) => {
            const earned = streak.current >= m;
            return (
              <span
                key={m}
                className={`tabular rounded-full px-3 py-1.5 text-[12.5px] font-bold ${
                  earned ? "bg-[var(--accent)] text-[#0F2E3D]" : "border border-[var(--line)] text-[var(--ink-3)]"
                }`}
              >
                {m} days
              </span>
            );
          })}
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-[var(--ink-3)]">
          Missing one day doesn&rsquo;t break the streak — you get one forgiven.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
        <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">Last 12 weeks</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {cells.map((c) => (
            <span
              key={c.key}
              title={c.key}
              className={`h-3.5 w-3.5 rounded-[3px] ${c.on ? "bg-[var(--accent)]" : "bg-[var(--line-soft)]"}`}
            />
          ))}
        </div>
        <p className="mt-2.5 text-[13px] text-[var(--ink-3)]">
          {loggedDays.size} of the last 84 days logged.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
        <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">Weight</p>
        <div className="mt-3">
          <WeightChart points={weights} goal={client.targetWeightKg} />
        </div>
      </div>
    </>
  );
}
