"use client";

import { ITEM_TYPES, SLOT_SUGGESTIONS, type ItemType, type PlanSlotDraft } from "@/lib/plan-types";
import type { PlanEditor } from "./usePlanEditor";
import { TYPE_STYLE } from "./types";

export function DayTabs({ editor }: { editor: PlanEditor }) {
  const { plan, day, activeDay, setActiveDay, locked, actions } = editor;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div role="group" aria-label="Days" className="flex flex-wrap gap-2">
        {plan.days.map((d) => (
          <button
            key={d.id}
            type="button"
            aria-pressed={d.index === activeDay}
            onClick={() => setActiveDay(d.index)}
            className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors ${
              d.index === activeDay
                ? "bg-[var(--accent)] text-[#0F2E3D]"
                : "border border-[var(--line)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)]"
            }`}
          >
            {d.label}
            {d.slots.length > 0 && <span className="tabular ml-1.5 opacity-55">{d.slots.length}<span className="sr-only"> slots</span></span>}
          </button>
        ))}
      </div>
      {!locked && plan.days.length > 1 && (
        <button
          type="button"
          onClick={actions.copyDayToAll}
          className="ml-auto rounded-full border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2 text-[13px] font-semibold text-[var(--ink-2)] hover:border-[var(--ink)]"
        >
          Copy {day.label} to all days
        </button>
      )}
    </div>
  );
}

function SlotCard({ slot, editor }: { slot: PlanSlotDraft; editor: PlanEditor }) {
  const { locked, actions } = editor;
  const grouped = slot.items.some((i) => i.optionGroup != null);
  const name = slot.label || "slot";

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)]">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] px-4 py-3">
        <input
          value={slot.label}
          readOnly={locked}
          aria-label="Slot name"
          onChange={(e) => actions.patchSlot(slot.id, (s) => ({ ...s, label: e.target.value }))}
          list="slot-suggestions"
          className="min-w-[150px] flex-1 border-0 bg-transparent p-0 text-[16px] font-semibold focus:outline-none"
        />
        <input
          value={slot.timeHint ?? ""}
          readOnly={locked}
          aria-label={`Time for ${name}`}
          onChange={(e) => actions.patchSlot(slot.id, (s) => ({ ...s, timeHint: e.target.value }))}
          placeholder="time e.g. 10 am"
          className="tabular h-[32px] w-[112px] rounded-lg border border-[var(--line)] px-2.5 text-[13px]"
        />
        <input
          value={slot.condition ?? ""}
          readOnly={locked}
          aria-label={`Only applies if (${name})`}
          onChange={(e) => actions.patchSlot(slot.id, (s) => ({ ...s, condition: e.target.value }))}
          placeholder="only if… e.g. leg day"
          className="h-[32px] w-[140px] rounded-lg border border-[var(--line)] px-2.5 text-[13px]"
        />
        {!locked && (
          <>
            <button
              type="button"
              aria-pressed={grouped}
              onClick={() => actions.toggleOptionGroup(slot.id)}
              className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold ${grouped ? "bg-[var(--accent)] text-[#0F2E3D]" : "border border-[var(--line)] text-[var(--ink-2)]"}`}
              title="Mark these items as interchangeable options"
            >
              {grouped ? "Options" : "Make options"}
            </button>
            <button
              type="button"
              onClick={() => actions.removeSlot(slot.id)}
              className="px-1.5 text-[var(--ink-3)] hover:text-[var(--alert)]"
              aria-label={`Remove ${name}`}
            >
              ✕
            </button>
          </>
        )}
      </div>

      {grouped && (
        <p className="border-b border-[var(--line-soft)] bg-[var(--accent)]/8 px-4 py-2 text-[13px] font-semibold text-[var(--accent-text)]">
          {slot.optionNote ?? "Any 1 from the given options"}
        </p>
      )}

      <div className="grid gap-1.5 p-3">
        {slot.items.map((item, ii) => (
          <div key={item.id} className="flex flex-wrap items-start gap-2 rounded-lg px-1 py-1 hover:bg-[var(--tint)]">
            {grouped && <span className="tabular mt-2 w-5 shrink-0 text-[13px] font-bold text-[var(--accent-text)]">{ii + 1}</span>}
            <select
              value={item.type}
              disabled={locked}
              aria-label={`Row ${ii + 1} type`}
              onChange={(e) => actions.patchItem(slot.id, item.id, { type: e.target.value as ItemType })}
              className={`h-[36px] shrink-0 rounded-lg border-0 px-2 text-[12px] font-bold ${TYPE_STYLE[item.type]}`}
            >
              {ITEM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.short}</option>)}
            </select>
            <textarea
              rows={1}
              value={item.text}
              readOnly={locked}
              aria-label={`${name} row ${ii + 1}`}
              onChange={(e) => actions.patchItem(slot.id, item.id, { text: e.target.value })}
              placeholder="Grated gheeya + missi roti ×2 with whisked curd (jeera, pudhina, dry ginger)"
              className="min-h-[36px] min-w-[200px] flex-1 resize-y rounded-lg border border-[var(--line)] px-3 py-2 text-[14px] leading-snug focus:border-[var(--ink)] focus:outline-none"
            />
            <input
              value={item.quantity ?? ""}
              readOnly={locked}
              aria-label={`Row ${ii + 1} quantity`}
              onChange={(e) => actions.patchItem(slot.id, item.id, { quantity: e.target.value })}
              placeholder="1 katori"
              className="h-[36px] w-[110px] shrink-0 rounded-lg border border-[var(--line)] px-2.5 text-[13px]"
            />
            {!locked && (
              <button
                type="button"
                onClick={() => actions.removeItem(slot.id, item.id)}
                className="mt-1 px-1.5 text-[var(--ink-3)] hover:text-[var(--alert)]"
                aria-label={`Remove row ${ii + 1}`}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {!locked && (
          <button
            type="button"
            onClick={() => actions.addItem(slot.id)}
            className="mt-1 w-fit rounded-lg px-2 py-1.5 text-[13.5px] font-semibold text-[var(--accent-text)] hover:bg-[var(--tint)]"
          >
            + Add {grouped ? "option" : "item"}
          </button>
        )}
      </div>
    </div>
  );
}

export function DaySlots({ editor }: { editor: PlanEditor }) {
  const { day, locked, actions } = editor;
  return (
    <div className="grid gap-3">
      {day.slots.map((slot) => <SlotCard key={slot.id} slot={slot} editor={editor} />)}

      {!locked && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-dashed border-[var(--line)] p-4">
          <button type="button" onClick={() => actions.addSlot()} className="rounded-full bg-[var(--ink)] px-4 py-2 text-[13.5px] font-semibold text-white">
            + Add slot
          </button>
          {SLOT_SUGGESTIONS.filter((l) => !day.slots.some((s) => s.label === l)).slice(0, 8).map((l) => (
            <button key={l} type="button" onClick={() => actions.addSlot(l)} className="rounded-full border border-[var(--line)] px-3.5 py-2 text-[13px] text-[var(--ink-2)] hover:border-[var(--ink)]">
              + {l}
            </button>
          ))}
        </div>
      )}
      <datalist id="slot-suggestions">
        {SLOT_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
      </datalist>
    </div>
  );
}

export function PlanSections({ editor }: { editor: PlanEditor }) {
  const { plan, locked, actions } = editor;
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2">
      {(["GUIDELINES", "NOTES"] as const).map((kind) => {
        const section = plan.sections.find((s) => s.kind === kind);
        const id = `plan-section-${kind.toLowerCase()}`;
        return (
          <div key={kind} className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4">
            <label htmlFor={id} className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">
              {kind === "GUIDELINES" ? "Guidelines" : "Notes"}
            </label>
            <textarea
              id={id}
              rows={6}
              readOnly={locked}
              aria-describedby={`${id}-hint`}
              value={(section?.items ?? []).join("\n")}
              onChange={(e) => actions.setSection(kind, e.target.value)}
              placeholder={kind === "GUIDELINES" ? "Walk 20 mins after meals\nSleep before 10:30 pm\nAvoid sugar, fried food, bakery" : "Always add a pinch of dry ginger, jeera and kali mirch"}
              className="mt-2 w-full rounded-lg border border-[var(--line)] p-3 text-[14px] leading-relaxed focus:border-[var(--ink)] focus:outline-none"
            />
            <p id={`${id}-hint`} className="mt-1.5 text-[12px] text-[var(--ink-3)]">One line per point.</p>
          </div>
        );
      })}
    </div>
  );
}
