import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentClient, sectionLines } from "@/lib/portal";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  SUPPLEMENT: "Supplement", EXERCISE: "Movement", BREATHWORK: "Breathing",
  LIFESTYLE: "Practice", HYDRATION: "Fluids", PREP: "Prepare", NOTE: "Note",
};

export default async function PlanPage() {
  const client = await currentClient();
  if (!client) return null;

  const plan = await prisma.dietPlan.findFirst({
    where: { clientId: client.id, status: "ACTIVE" },
    orderBy: { version: "desc" },
    include: {
      days: { orderBy: { index: "asc" }, include: { slots: { orderBy: { order: "asc" }, include: { items: { orderBy: { order: "asc" } } } } } },
      sections: { orderBy: { order: "asc" } },
    },
  });

  if (!plan) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-6 py-10">
        <h1 className="font-[var(--font-display)] text-[22px] font-bold">No plan yet</h1>
        <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-[var(--ink-2)]">
          Your dietitian is preparing it. You&rsquo;ll get a message the moment it&rsquo;s ready.
        </p>
      </div>
    );
  }

  const everyDay = plan.days.find((d) => d.index === -1);
  const days = plan.days.filter((d) => d.index >= 0);

  return (
    <>
      <h1 className="font-[var(--font-display)] text-[clamp(24px,4vw,30px)] font-bold tracking-[-0.02em]">
        {plan.title}
      </h1>
      <p className="mt-1.5 text-[14px] text-[var(--ink-3)]">
        Version {plan.version} · updated{" "}
        {(plan.publishedAt ?? plan.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
      </p>

      {everyDay && everyDay.slots.length > 0 && (
        <section className="mt-7 rounded-2xl border-2 border-[var(--accent)] bg-[var(--accent)]/6 px-5 py-5">
          <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.14em]">Every day</h2>
          {everyDay.slots.map((s) => <SlotView key={s.id} slot={s} />)}
        </section>
      )}

      {days.map((d) => (
        <section key={d.id} className="mt-7">
          {plan.dayMode !== "SINGLE" && (
            <h2 className="mb-3 border-b border-[var(--line)] pb-2 font-[var(--font-display)] text-[19px] font-bold">
              {d.label}
            </h2>
          )}
          {d.slots.map((s) => <SlotView key={s.id} slot={s} />)}
        </section>
      ))}

      {plan.sections.map((sec) => {
        const items = sectionLines(sec.items);
        if (!items.length) return null;
        return (
          <section key={sec.id} className="mt-7 rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-5 py-5">
            <h2 className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">
              {sec.title ?? (sec.kind === "GUIDELINES" ? "Guidelines" : "Notes")}
            </h2>
            <ul className="grid gap-2">
              {items.map((line, i) => (
                <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-[var(--ink-2)]">
                  <span aria-hidden className="text-[var(--accent-text)]">·</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--tint)] px-5 py-4">
        <p className="text-[13.5px] leading-relaxed text-[var(--ink-2)]">
          Something here not working for you? <Link href="/portal/messages" className="font-semibold underline">Tell your dietitian</Link> —
          a plan you can&rsquo;t follow is a plan that needs changing, not a failure.
        </p>
      </div>
    </>
  );
}

function SlotView({ slot }: { slot: { id: string; label: string; timeHint: string | null; condition: string | null; optionNote: string | null; items: { id: string; type: string; text: string; quantity: string | null; optionGroup: number | null }[] } }) {
  if (!slot.items.length) return null;
  const options = slot.items.filter((i) => i.optionGroup != null);
  const plain = slot.items.filter((i) => i.optionGroup == null);

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="text-[13px] font-bold uppercase tracking-[0.1em]">{slot.label}</h3>
        {slot.timeHint && <span className="tabular text-[13px] text-[var(--ink-3)]">{slot.timeHint}</span>}
        {slot.condition && (
          <span className="rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#0F2E3D]">
            {slot.condition}
          </span>
        )}
      </div>
      {plain.length > 0 && (
        <ul className="mt-1.5 grid gap-1">
          {plain.map((i) => (
            <li key={i.id} className="flex gap-2.5 text-[15px] leading-relaxed">
              <span aria-hidden className="text-[var(--ink-3)]">–</span>
              <span>
                {i.type !== "FOOD" && (
                  <span className="mr-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--accent-text)]">
                    {TYPE_LABEL[i.type]}
                  </span>
                )}
                {i.text}
                {i.quantity && <span className="text-[var(--ink-2)]"> — {i.quantity}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
      {options.length > 0 && (
        <div className="mt-2 border-l-2 border-[var(--line)] pl-4">
          <p className="text-[12.5px] font-bold italic text-[var(--accent-text)]">
            {slot.optionNote ?? "Any 1 of these"}
          </p>
          <ol className="mt-1 grid gap-1">
            {options.map((i, n) => (
              <li key={i.id} className="flex gap-2.5 text-[15px] leading-relaxed">
                <span className="tabular shrink-0 font-semibold text-[var(--ink-3)]">{n + 1}.</span>
                <span>{i.text}{i.quantity && <span className="text-[var(--ink-2)]"> — {i.quantity}</span>}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
