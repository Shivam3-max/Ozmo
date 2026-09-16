import type { ReportData } from "@/lib/services/reports";

const kg = (n: number | null) => (n === null ? "—" : `${n} kg`);
const cm = (n: number | null) => (n === null ? "—" : `${n} cm`);
const signed = (n: number | null, unit: string) => (n === null ? "—" : `${n > 0 ? "+" : ""}${n} ${unit}`);

/** The numbers section of a progress report — the same in the admin editor and the portal. */
export function ReportFigures({ data }: { data: ReportData }) {
  const rows: [string, string, string?][] = [
    ["Weight", `${kg(data.weight.start)} → ${kg(data.weight.end)}`, signed(data.weight.change, "kg")],
    ["Waist", `${cm(data.waist.start)} → ${cm(data.waist.end)}`, signed(data.waist.change, "cm")],
    ["Days with meals logged", `${data.daysLogged} of ${data.days}`],
    ["Meals logged", `${data.mealsLogged}${data.offPlanMeals ? ` (${data.offPlanMeals} off plan)` : ""}`],
    ["Days on water target", `${data.hydrationDays} of ${data.days}`],
    ["Weigh-ins", String(data.weighIns)],
    ["Follow-ups completed", String(data.followUpsCompleted)],
  ];
  return (
    <dl className="grid gap-0 text-[14px]">
      {rows.map(([label, value, change]) => (
        <div key={label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-[var(--line-soft)] py-2.5 last:border-0">
          <dt className="text-[var(--ink-3)]">{label}</dt>
          <dd className="tabular font-semibold">
            {value}
            {change && change !== "—" && <span className="ml-2 font-normal text-[var(--ink-2)]">({change})</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ReportText({ title, body }: { title: string; body: string | null }) {
  if (!body?.trim()) return null;
  return (
    <section className="grid gap-2">
      <h2 className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">{title}</h2>
      <p className="max-w-[68ch] whitespace-pre-line text-[15px] leading-relaxed text-[var(--ink-2)]">{body}</p>
    </section>
  );
}
