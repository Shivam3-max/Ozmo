import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { asStrings } from "@/lib/json";
import PrintTrigger from "@/components/admin/PrintTrigger";
import { CLINIC_TIME_ZONE } from "@/lib/clinic-time";
import { can } from "@/lib/policy";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  SUPPLEMENT: "Supplement",
  EXERCISE: "Movement",
  BREATHWORK: "Breathing",
  LIFESTYLE: "Practice",
  HYDRATION: "Fluids",
  PREP: "Prepare",
  NOTE: "Note",
};

export default async function PlanPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  if (!can(user.role, "plans.edit")) notFound();

  const { id } = await params;
  const plan = await prisma.dietPlan.findFirst({
    where: { id, client: { clinicId: user.clinicId } },
    include: {
      days: { orderBy: { index: "asc" }, include: { slots: { orderBy: { order: "asc" }, include: { items: { orderBy: { order: "asc" } } } } } },
      sections: { orderBy: { order: "asc" } },
      client: { include: { user: true } },
      createdBy: true,
    },
  });
  if (!plan) notFound();

  const everyDay = plan.days.find((d) => d.index === -1);
  const realDays = plan.days.filter((d) => d.index >= 0);

  return (
    <div className="plan-print mx-auto max-w-[820px] bg-white px-10 py-10 text-[#0F2E3D]">
      <PrintTrigger />

      {/* letterhead */}
      <header className="mb-8 flex items-start justify-between border-b-[3px] border-[#0F2E3D] pb-5">
        <div>
          <p className="font-[var(--font-display)] text-[30px] font-extrabold leading-none tracking-[-0.03em]">OZMO</p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.28em]">Diet Clinic</p>
        </div>
        <div className="text-right text-[12px] leading-relaxed">
          <p className="font-semibold">{plan.client.user.name}</p>
          <p className="tabular text-[#4E6672]">{plan.client.clientCode}</p>
          <p className="tabular text-[#4E6672]">
            {(plan.publishedAt ?? plan.updatedAt).toLocaleDateString("en-IN", { timeZone: CLINIC_TIME_ZONE, day: "numeric", month: "long", year: "numeric" })}
          </p>
          <p className="tabular text-[#4E6672]">Version {plan.version}</p>
        </div>
      </header>

      <h1 className="font-[var(--font-display)] text-[26px] font-bold leading-tight tracking-[-0.02em]">{plan.title}</h1>
      {(plan.dietPreference || plan.conditionsNote) && (
        <p className="mt-1.5 text-[13px] text-[#4E6672]">
          {[plan.dietPreference, plan.conditionsNote].filter(Boolean).join(" · ")}
        </p>
      )}

      {plan.showTargets && plan.targetCalories && (
        <p className="tabular mt-3 inline-block rounded border border-[#DCE6EA] px-3 py-1.5 text-[12px]">
          Around {plan.targetCalories} kcal · {plan.targetProtein ?? "—"} g protein
        </p>
      )}

      {everyDay && everyDay.slots.length > 0 && (
        <section className="mt-8 break-inside-avoid rounded border-2 border-[#F7D117] bg-[#FFFDF2] px-6 py-5">
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em]">Every day</h2>
          {everyDay.slots.map((s) => (
            <SlotBlock key={s.id} slot={s} />
          ))}
        </section>
      )}

      {realDays.map((d) => (
        <section key={d.id} className="mt-8 break-inside-avoid">
          {plan.dayMode !== "SINGLE" && (
            <h2 className="mb-3 border-b border-[#DCE6EA] pb-1.5 font-[var(--font-display)] text-[18px] font-bold">
              {d.label}
            </h2>
          )}
          {d.slots.map((s) => (
            <SlotBlock key={s.id} slot={s} />
          ))}
        </section>
      ))}

      {plan.sections.map((sec) => {
        const items = asStrings(sec.items);
        if (!items.length) return null;
        return (
          <section key={sec.id} className="mt-8 break-inside-avoid rounded bg-[#F4F8F9] px-6 py-5">
            <h2 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em]">
              {sec.title ?? (sec.kind === "GUIDELINES" ? "Guidelines" : "Notes")}
            </h2>
            <ul className="grid gap-1.5">
              {items.map((line, i) => (
                <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed">
                  <span aria-hidden>·</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <footer className="mt-10 border-t border-[#DCE6EA] pt-5 text-[11px] leading-relaxed text-[#4E6672]">
        <p>
          <strong className="text-[#0F2E3D]">This plan is nutrition and lifestyle guidance, not medical advice.</strong>{" "}
          Ozmo Diet Clinic does not diagnose or treat medical conditions. Continue to follow your
          doctor&rsquo;s advice, and never start, stop or change any medication without speaking to
          them. Results vary from person to person.
        </p>
        <p className="mt-2.5">
          Prepared by {plan.createdBy.name} · Ozmo Diet Clinic · Plan {plan.id.slice(-8)} · Personal
          to {plan.client.user.name}, please don&rsquo;t redistribute.
        </p>
      </footer>
    </div>
  );
}

function SlotBlock({
  slot,
}: {
  slot: {
    id: string; label: string; timeHint: string | null; condition: string | null; optionNote: string | null;
    items: { id: string; type: string; text: string; quantity: string | null; optionGroup: number | null }[];
  };
}) {
  if (slot.items.length === 0) return null;
  const options = slot.items.filter((i) => i.optionGroup != null);
  const plain = slot.items.filter((i) => i.optionGroup == null);

  return (
    <div className="mb-4 break-inside-avoid">
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="text-[13.5px] font-bold uppercase tracking-[0.1em]">{slot.label}</h3>
        {slot.timeHint && <span className="tabular text-[12px] text-[#4E6672]">{slot.timeHint}</span>}
        {slot.condition && (
          <span className="rounded-full bg-[#F7D117] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em]">
            {slot.condition}
          </span>
        )}
      </div>

      {plain.length > 0 && (
        <ul className="mt-1.5 grid gap-1">
          {plain.map((i) => (
            <li key={i.id} className="flex gap-2.5 text-[13.5px] leading-relaxed">
              <span aria-hidden className="text-[#7D939D]">–</span>
              <span>
                {i.type !== "FOOD" && (
                  <span className="mr-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A6D00]">
                    {TYPE_LABEL[i.type]}
                  </span>
                )}
                {i.text}
                {i.quantity && <span className="text-[#4E6672]"> — {i.quantity}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      {options.length > 0 && (
        <div className="mt-2 border-l-2 border-[#DCE6EA] pl-3.5">
          <p className="text-[11.5px] font-bold italic text-[#8A6D00]">
            {slot.optionNote ?? "Any 1 from the given options"}
          </p>
          <ol className="mt-1 grid gap-1">
            {options.map((i, n) => (
              <li key={i.id} className="flex gap-2.5 text-[13.5px] leading-relaxed">
                <span className="tabular shrink-0 font-semibold">{n + 1}.</span>
                <span>
                  {i.text}
                  {i.quantity && <span className="text-[#4E6672]"> — {i.quantity}</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
