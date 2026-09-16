import { prisma } from "@/lib/db";
import { currentClient } from "@/lib/portal";
import RecordWeight from "@/components/portal/RecordWeight";
import WeightChart from "@/components/portal/WeightChart";
import { CLINIC_TIME_ZONE } from "@/lib/clinic-time";

export const dynamic = "force-dynamic";

export default async function MeasurementsPage() {
  const client = await currentClient();
  if (!client) return null;

  const measurements = await prisma.measurement.findMany({
    where: { clientId: client.id },
    orderBy: { date: "asc" },
    take: 200,
  });

  const weights = measurements.filter((m) => m.weightKg != null).map((m) => ({ date: m.date, weight: m.weightKg! }));
  const last = weights.at(-1)?.weight ?? null;
  const start = client.startWeightKg ?? weights[0]?.weight ?? null;
  const change = last !== null && start !== null ? Math.round((last - start) * 10) / 10 : null;

  return (
    <>
      <h1 className="font-[var(--font-display)] text-[clamp(24px,4vw,30px)] font-bold tracking-[-0.02em]">
        Measurements
      </h1>
      <p className="mt-1.5 text-[14.5px] text-[var(--ink-3)]">Weekly is plenty. Daily weighing tells you about water, not fat.</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <RecordWeight lastWeight={last} />

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { l: "Starting", v: start !== null ? `${start}` : "—" },
              { l: "Latest", v: last !== null ? `${last}` : "—" },
              { l: "Change", v: change !== null ? `${change > 0 ? "+" : ""}${change}` : "—", good: change !== null && change < 0 },
            ].map((t) => (
              <div key={t.l}>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">{t.l}</p>
                <p className={`tabular mt-1.5 font-[var(--font-display)] text-[24px] font-bold leading-none ${t.good ? "text-[var(--good)]" : ""}`}>
                  {t.v}
                  {t.v !== "—" && <span className="ml-1 text-[13px] font-normal text-[var(--ink-3)]">kg</span>}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <WeightChart points={weights} goal={client.targetWeightKg} />
          </div>
        </div>
      </div>

      {measurements.length > 0 && (
        <div className="mt-7 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)]">
          <table className="w-full border-collapse text-[14.5px]">
            <thead>
              <tr>
                {["Date", "Weight", "Waist", "Hip", "Note"].map((h) => (
                  <th key={h} className="border-b border-[var(--line)] bg-[var(--tint)] px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...measurements].reverse().map((m) => (
                <tr key={m.id}>
                  <td className="tabular border-b border-[var(--line-soft)] px-4 py-3">
                    {m.date.toLocaleDateString("en-IN", { timeZone: CLINIC_TIME_ZONE, day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="tabular border-b border-[var(--line-soft)] px-4 py-3 font-semibold">{m.weightKg ?? "—"}</td>
                  <td className="tabular border-b border-[var(--line-soft)] px-4 py-3">{m.waistCm ?? "—"}</td>
                  <td className="tabular border-b border-[var(--line-soft)] px-4 py-3">{m.hipCm ?? "—"}</td>
                  <td className="border-b border-[var(--line-soft)] px-4 py-3 text-[var(--ink-3)]">{m.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
