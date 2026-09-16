import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentClient, todaysPlan, todaysLogs, ozmoScore, currentStreak, BAND_COPY } from "@/lib/portal";
import MealRow from "@/components/portal/MealRow";
import { clinicDay, clinicHour, daysBetween, formatClinic } from "@/lib/clinic-time";
import WaterTracker from "@/components/portal/WaterTracker";

export const dynamic = "force-dynamic";

export default async function PortalHome() {
  const client = await currentClient();
  if (!client) return null;

  const enrollment = client.enrollments[0];
  const [today, { logs, water }, score, streak, latest] = await Promise.all([
    todaysPlan(client.id, enrollment?.startDate),
    todaysLogs(client.id),
    ozmoScore(client.id, enrollment?.startDate ?? client.joinedAt),
    currentStreak(client.id),
    prisma.measurement.findFirst({
      where: { clientId: client.id, weightKg: { not: null } },
      orderBy: { date: "desc" },
    }),
  ]);

  const loggedBySlot = new Map(logs.map((l) => [l.slotLabel, l]));
  const done = today ? today.slots.filter((s) => loggedBySlot.has(s.label)).length : 0;
  const total = today?.slots.length ?? 0;

  const hour = clinicHour();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const change =
    latest?.weightKg && client.startWeightKg
      ? Math.round((latest.weightKg - client.startWeightKg) * 10) / 10
      : null;

  const dayNo = enrollment ? Math.max(1, daysBetween(clinicDay(enrollment.startDate), clinicDay()) + 1) : null;
  const totalDays = enrollment ? daysBetween(clinicDay(enrollment.startDate), clinicDay(enrollment.endDate)) : null;

  return (
    <>
      <h1 className="font-[var(--font-display)] text-[clamp(26px,4.5vw,34px)] font-bold tracking-[-0.02em]">
        {greeting}, {client.user.name.split(" ")[0]}
      </h1>
      <p className="mt-1.5 text-[14.5px] text-[var(--ink-3)]">
        {formatClinic(new Date(), { weekday: "long", day: "numeric", month: "long" })}
        {dayNo && totalDays ? ` · day ${dayNo} of ${totalDays}` : ""}
      </p>

      {/* metric row */}
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-4">
        {[
          { l: "Weight", v: latest?.weightKg ? `${latest.weightKg}` : "—", s: change !== null ? `${change > 0 ? "+" : ""}${change} kg since start` : "not recorded yet", good: change !== null && change < 0 },
          { l: "Ozmo Score", v: String(score.score), s: score.band, good: score.score >= 70 },
          { l: "Today", v: `${done}/${total || "—"}`, s: "logged", good: total > 0 && done === total },
          { l: "Streak", v: String(streak.current), s: streak.current === 1 ? "day" : "days", good: streak.current >= 3 },
        ].map((t) => (
          <div key={t.l} className="bg-[var(--paper)] px-4 py-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">{t.l}</p>
            <p className="tabular mt-2 font-[var(--font-display)] text-[28px] font-bold leading-none">{t.v}</p>
            <p className={`mt-1.5 text-[12.5px] font-semibold ${t.good ? "text-[var(--good)]" : "text-[var(--ink-3)]"}`}>
              {t.s}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-2)]">{BAND_COPY[score.band]}</p>

      {/* today's plan */}
      <div className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-[var(--font-display)] text-[20px] font-bold">Today&rsquo;s plan</h2>
          {today && <Link href="/portal/plan" className="text-[13.5px] font-semibold text-[var(--accent-text)]">Full plan →</Link>}
        </div>

        {!today ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-6 py-8">
            <p className="font-[var(--font-display)] text-[19px] font-bold">Your plan is on its way</p>
            <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-[var(--ink-2)]">
              Your dietitian is building it after your consultation. You&rsquo;ll get a message the
              moment it&rsquo;s here. In the meantime you can record your starting weight.
            </p>
            <Link href="/portal/measurements" className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-[var(--ink)] px-5 text-[15px] font-semibold text-white">
              Record my weight
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {today.slots.map((slot) => {
              const log = loggedBySlot.get(slot.label);
              return (
                <MealRow
                  key={slot.id}
                  slot={{
                    id: slot.id, label: slot.label, timeHint: slot.timeHint,
                    condition: slot.condition, optionNote: slot.optionNote,
                    items: slot.items.map((i) => ({
                      id: i.id, type: i.type, text: i.text, quantity: i.quantity, optionGroup: i.optionGroup,
                    })),
                  }}
                  logged={Boolean(log)}
                  source={log?.source}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6">
        <WaterTracker glasses={water?.glasses ?? 0} target={water?.targetGlasses ?? 8} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/portal/measurements" className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-[14px] font-semibold hover:border-[var(--ink)]">
          Record weight
        </Link>
        <Link href="/portal/messages" className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-[14px] font-semibold hover:border-[var(--ink)]">
          Message {client.primaryDietitian?.name.split(" ")[0] ?? "your dietitian"}
        </Link>
        <Link href="/portal/progress" className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-[14px] font-semibold hover:border-[var(--ink)]">
          See progress
        </Link>
      </div>
    </>
  );
}
