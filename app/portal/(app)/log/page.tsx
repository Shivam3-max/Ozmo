import Link from "next/link";
import { currentClient, todaysPlan, todaysLogs } from "@/lib/portal";
import MealRow from "@/components/portal/MealRow";
import WaterTracker from "@/components/portal/WaterTracker";

export const dynamic = "force-dynamic";

export default async function LogPage() {
  const client = await currentClient();
  if (!client) return null;

  const enrollment = client.enrollments[0];
  const [today, { logs, water }] = await Promise.all([
    todaysPlan(client.id, enrollment?.startDate),
    todaysLogs(client.id),
  ]);

  const bySlot = new Map(logs.map((l) => [l.slotLabel, l]));
  const done = today ? today.slots.filter((s) => bySlot.has(s.label)).length : 0;
  const total = today?.slots.length ?? 0;

  return (
    <>
      <h1 className="font-[var(--font-display)] text-[clamp(24px,4vw,30px)] font-bold tracking-[-0.02em]">Log today</h1>
      <p className="mt-1.5 text-[14.5px] text-[var(--ink-3)]">
        {total > 0 ? `${done} of ${total} done · takes under a minute` : "Under a minute a day"}
      </p>

      <div className="mt-6">
        <WaterTracker glasses={water?.glasses ?? 0} target={water?.targetGlasses ?? 8} />
      </div>

      {!today ? (
        <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-6 py-8">
          <p className="font-[var(--font-display)] text-[19px] font-bold">No plan to log against yet</p>
          <p className="mt-2 max-w-[50ch] text-[15px] leading-relaxed text-[var(--ink-2)]">
            Once your dietitian publishes your plan, each meal appears here to tick off. You can
            still record your weight in the meantime.
          </p>
          <Link href="/portal/measurements" className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-[var(--ink)] px-5 text-[15px] font-semibold text-white">
            Record weight
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {today.slots.map((slot) => {
            const log = bySlot.get(slot.label);
            return (
              <MealRow
                key={slot.id}
                slot={{
                  id: slot.id, label: slot.label, timeHint: slot.timeHint,
                  condition: slot.condition, optionNote: slot.optionNote,
                  items: slot.items.map((i) => ({ id: i.id, type: i.type, text: i.text, quantity: i.quantity, optionGroup: i.optionGroup })),
                }}
                logged={Boolean(log)}
                source={log?.source}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
