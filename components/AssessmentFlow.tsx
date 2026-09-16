"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useEffect, useMemo, useState } from "react";
import { questions, steps, mealSlots, answerProblem, TEXT_MAX, TEXTAREA_MAX, MEAL_MAX, type Answers } from "@/lib/assessment";

const goalFromParam: Record<string, string> = {
  "lose-weight": "Lose weight",
  condition: "Manage a health condition",
  "gain-weight": "Gain weight",
  fitness: "Build fitness or muscle",
  wellness: "Feel better overall",
};

export default function AssessmentFlow() {
  const params = useSearchParams();
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const [contact, setContact] = useState({ email: "", phone: "", city: "", consent: false, marketing: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const flowTop = useRef<HTMLDivElement>(null);
  const submitted = useRef(false);

  useEffect(() => {
    const g = params.get("goal");
    if (g && goalFromParam[g]) {
      setAnswers((a) => ({ ...a, goal: goalFromParam[g] }));
      setStarted(true);
    }
  }, [params]);

  const visible = useMemo(() => questions.filter((q) => !q.showIf || q.showIf(answers)), [answers]);
  const q = visible[idx];
  // Counted against the full question list, so the total never jumps when a
  // follow-up question appears; skipped follow-ups just move the count forward.
  const position = q ? questions.indexOf(q) + 1 : questions.length;
  const pct = Math.round((position / (questions.length + 1)) * 100);

  // Each new question starts at the top, clear of the sticky header and progress bar.
  // (autoFocus would otherwise scroll the input up underneath them on phones.)
  useEffect(() => {
    if (!started || done) return;
    const frame = requestAnimationFrame(() => {
      const el = flowTop.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
    });
    return () => cancelAnimationFrame(frame);
  }, [idx, started, done]);

  // Answers live only in this tab (health details aren't stored on the device),
  // so warn before a refresh or tab close throws them away.
  const hasAnswers = Object.keys(answers).length > 0;
  useEffect(() => {
    if (!hasAnswers) return;
    const warn = (e: BeforeUnloadEvent) => {
      if (!submitted.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasAnswers]);

  const set = (id: string, v: Answers[string]) => setAnswers((a) => ({ ...a, [id]: v }));

  const problem = q ? answerProblem(q, answers[q.id]) : null;
  const answered = (() => {
    if (!q || problem) return false;
    if (q.optional) return true;
    const v = answers[q.id];
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object" && v !== null) return true;
    return typeof v === "string" && v.trim().length > 0;
  })();

  const next = () => (idx < visible.length - 1 ? setIdx(idx + 1) : setDone(true));
  const back = () => (idx > 0 ? setIdx(idx - 1) : setStarted(false));

  const toggleMulti = (id: string, opt: string, exclusive?: string) => {
    const cur = Array.isArray(answers[id]) ? (answers[id] as string[]) : [];
    if (exclusive && opt === exclusive) return set(id, cur.includes(opt) ? [] : [opt]);
    const cleaned = exclusive ? cur.filter((c) => c !== exclusive) : cur;
    set(id, cleaned.includes(opt) ? cleaned.filter((c) => c !== opt) : [...cleaned, opt]);
  };

  /* ---------- intro ---------- */
  if (!started) {
    return (
      <div className="relative mx-auto w-full max-w-[760px] px-6 py-16 md:py-24">
        <p className="eyebrow">Free health assessment</p>
        <h1 className="mt-6 text-[clamp(38px,5.8vw,64px)] leading-[0.99]">Let&rsquo;s find out where you actually stand</h1>
        <p className="mt-8 text-[clamp(17px,1.7vw,20px)] leading-[1.55] text-[var(--ink-2)]">
          A few questions about your body, your routine and how you eat. At the end you&rsquo;ll get
          your Ozmo Health Snapshot — a personalised summary with your key numbers and a clear first
          step.
        </p>
        <div className="mt-9 grid gap-3 sm:grid-cols-3">
          {["About 4 minutes", "No payment, no obligation", "Your answers are private"].map((t) => (
            <div key={t} className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-5 py-4 text-[14.5px] font-medium">
              {t}
            </div>
          ))}
        </div>
        <button
          onClick={() => setStarted(true)}
          className="mt-10 inline-flex min-h-[56px] items-center gap-2.5 rounded-full bg-[var(--ink)] px-8 text-[16px] font-semibold text-white shadow-[0_2px_10px_rgba(15,46,61,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#163B4D]"
        >
          Start →
        </button>
        <p className="mt-8 max-w-[60ch] text-[13.5px] leading-relaxed text-[var(--ink-3)]">
          Your answers are used to prepare your Snapshot and, if you choose to book, to make your
          consultation more useful. Read our{" "}
          <Link href="/privacy-policy" className="underline">Privacy Policy</Link>. This is not a
          medical assessment and doesn&rsquo;t diagnose anything.
        </p>
      </div>
    );
  }

  /* ---------- contact capture ---------- */
  if (done) {
    return (
      <div className="relative mx-auto w-full max-w-[640px] px-6 py-16 md:py-24">
        <p className="eyebrow">Almost there</p>
        <h1 className="mt-5 text-[clamp(34px,5vw,52px)] leading-[0.99]">Your Snapshot is ready</h1>
        <p className="mt-4 text-[17px] text-[var(--ink-2)]">Where should we send it?</p>

        <form
          className="mt-8 grid gap-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (submitting) return;
            setSubmitting(true);
            setSubmitError(null);
            try {
              const res = await fetch("/api/assessment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  answers,
                  contact: {
                    email: contact.email,
                    phone: contact.phone,
                    city: contact.city,
                    consentService: contact.consent,
                    consentMarketing: contact.marketing,
                  },
                }),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok || !data?.token) {
                const firstField = data?.fields ? Object.values(data.fields as Record<string, string>)[0] : null;
                setSubmitError(firstField ? `${data.error} ${firstField}` : data?.error ?? "We couldn't save your answers. Please try again.");
                setSubmitting(false);
                return;
              }
              submitted.current = true;
              router.push(`/assessment/snapshot/${data.token}`);
            } catch {
              setSubmitError("We couldn't reach the server. Please check your connection and try again.");
              setSubmitting(false);
            }
          }}
        >
          <label className="grid gap-2">
            <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Email</span>
            <input
              type="email"
              required
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              className="min-h-[54px] rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 text-[16px]"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Phone (WhatsApp)</span>
            <input
              type="tel"
              required
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              className="min-h-[54px] rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 text-[16px]"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">City <span className="font-normal normal-case tracking-normal">(optional)</span></span>
            <input
              type="text"
              value={contact.city}
              onChange={(e) => setContact({ ...contact, city: e.target.value })}
              className="min-h-[54px] rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 text-[16px]"
            />
          </label>

          <label className="flex items-start gap-3 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
            <input
              type="checkbox"
              required
              checked={contact.consent}
              onChange={(e) => setContact({ ...contact, consent: e.target.checked })}
              className="mt-1 h-4 w-4 shrink-0"
            />
            <span>
              I agree to Ozmo preparing and sending my Health Snapshot, and to being contacted about
              it. I&rsquo;ve read the <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
            </span>
          </label>
          <label className="flex items-start gap-3 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
            <input
              type="checkbox"
              checked={contact.marketing}
              onChange={(e) => setContact({ ...contact, marketing: e.target.checked })}
              className="mt-1 h-4 w-4 shrink-0"
            />
            <span>Send me occasional nutrition tips and updates. (You can unsubscribe any time.)</span>
          </label>

          {submitError && (
            <p role="alert" className="rounded-xl border border-[var(--alert)]/30 bg-[var(--alert)]/6 px-4 py-3 text-[14.5px] text-[var(--ink-2)]">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-3 inline-flex min-h-[56px] items-center justify-center rounded-full bg-[var(--ink)] px-8 text-[16px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#163B4D] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {submitting ? "Preparing your Snapshot…" : "See my Snapshot →"}
          </button>
        </form>

        <p className="mt-7 text-[13.5px] leading-relaxed text-[var(--ink-3)]">
          We don&rsquo;t sell your data. Ever. Your health information is stored securely and only
          your dietitian and clinic staff can see it.
        </p>
        <button onClick={() => setDone(false)} className="mt-5 text-[14.5px] text-[var(--ink-2)] underline">
          ← Back to the last question
        </button>
      </div>
    );
  }

  /* ---------- question ---------- */
  const step = steps.find((s) => s.n === q.step)!;
  const firstOfStep = visible.findIndex((v) => v.step === q.step) === idx;

  return (
    <div ref={flowTop} className="relative mx-auto w-full max-w-[760px] px-6 py-12 md:py-16">
      {/* progress */}
      <div className="sticky top-[72px] z-10 -mx-6 mb-10 bg-[var(--ground)] px-6 pb-4 pt-3">
        <div className="flex items-baseline justify-between text-[13px] text-[var(--ink-3)]">
          <span className="font-bold uppercase tracking-[0.1em]">
            Step {q.step} of 7 · {step.title}
          </span>
          <span className="tabular" aria-label={`Question ${position} of ${questions.length}`}>
            {position} / {questions.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--line-soft)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {firstOfStep && <p className="mb-6 text-[15.5px] italic text-[var(--ink-2)]">{step.intro}</p>}

      <h1 id={`q-${q.id}`} className="text-[clamp(28px,4.2vw,44px)] leading-[1.04]">{q.label}</h1>
      {q.helper && <p id={`q-${q.id}-help`} className="mt-3 text-[15.5px] leading-relaxed text-[var(--ink-2)]">{q.helper}</p>}

      <div className="mt-8">
        {/* text / number */}
        {(q.type === "text" || q.type === "number") && (
          <input
            type={q.type === "number" ? "number" : "text"}
            inputMode={q.type === "number" ? "numeric" : "text"}
            min={q.min}
            max={q.max}
            autoFocus
            aria-labelledby={`q-${q.id}`}
            aria-describedby={q.helper ? `q-${q.id}-help` : undefined}
            placeholder={q.placeholder}
            maxLength={q.type === "text" ? TEXT_MAX : undefined}
            value={(answers[q.id] as string) || ""}
            onChange={(e) => set(q.id, e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && answered) next(); }}
            className="min-h-[60px] w-full max-w-[400px] rounded-xl border border-[var(--line)] bg-[var(--paper)] px-5 text-[19px]"
          />
        )}

        {/* height / weight with unit */}
        {(q.type === "height" || q.type === "weight") && (
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              autoFocus
              aria-labelledby={`q-${q.id}`}
              aria-describedby={`q-${q.id}-unit`}
              placeholder={q.type === "height" ? "e.g. 168" : "e.g. 78"}
              value={(answers[q.id] as string) || ""}
              onChange={(e) => set(q.id, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && answered) next(); }}
              className="min-h-[60px] w-[190px] rounded-xl border border-[var(--line)] bg-[var(--paper)] px-5 text-[19px]"
            />
            <span id={`q-${q.id}-unit`} className="text-[16px] font-medium text-[var(--ink-2)]">
              {q.type === "height" ? "cm" : "kg"}
            </span>
          </div>
        )}

        {/* textarea */}
        {q.type === "textarea" && (
          <textarea
            rows={q.id === "blocker" ? 6 : 3}
            autoFocus
            aria-labelledby={`q-${q.id}`}
            aria-describedby={q.helper ? `q-${q.id}-help` : undefined}
            placeholder={q.placeholder}
            maxLength={TEXTAREA_MAX}
            value={(answers[q.id] as string) || ""}
            onChange={(e) => set(q.id, e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] p-5 text-[16.5px] leading-relaxed"
          />
        )}

        {/* single */}
        {q.type === "single" && (
          <div
            role="radiogroup"
            aria-labelledby={`q-${q.id}`}
            className="grid gap-2.5"
            onKeyDown={(e) => {
              // Arrow keys move between options, as in a native radio group.
              if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key)) return;
              e.preventDefault();
              const radios = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=radio]"));
              const at = radios.indexOf(document.activeElement as HTMLButtonElement);
              const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
              radios[(at + step + radios.length) % radios.length]?.focus();
            }}
          >
            {q.options!.map((o, oi) => {
              const on = answers[q.id] === o;
              const selected = q.options!.some((x) => answers[q.id] === x);
              return (
                <button
                  key={o}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={on || (!selected && oi === 0) ? 0 : -1}
                  onClick={() => { set(q.id, o); setTimeout(() => (idx < visible.length - 1 ? setIdx(idx + 1) : setDone(true)), 160); }}
                  className={`rounded-xl border px-6 py-4.5 text-left text-[17px] transition-all duration-150 hover:-translate-y-0.5 ${
                    on
                      ? "border-[var(--ink)] bg-[var(--accent)]/15 font-semibold"
                      : "border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)]"
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
        )}

        {/* multi */}
        {q.type === "multi" && (
          <>
            <p className="mb-4 text-[14px] text-[var(--ink-3)]">Choose as many as apply.</p>
            <div role="group" aria-labelledby={`q-${q.id}`} className="grid gap-2.5 sm:grid-cols-2">
              {q.options!.map((o) => {
                const cur = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
                const on = cur.includes(o);
                return (
                  <button
                    key={o}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggleMulti(q.id, o, q.exclusive)}
                    className={`rounded-xl border px-5 py-4 text-left text-[16px] transition-all duration-150 hover:-translate-y-0.5 ${
                      on
                        ? "border-[var(--ink)] bg-[var(--accent)]/15 font-semibold"
                        : "border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)]"
                    }`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* typical day */}
        {q.type === "mealday" && (
          <div className="grid gap-4">
            {mealSlots.map((m) => {
              const cur = (answers[q.id] as Record<string, string>) || {};
              return (
                <label key={m.id} className="grid gap-2">
                  <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">
                    {m.label}
                  </span>
                  <input
                    type="text"
                    placeholder="Roughly what, and roughly when"
                    maxLength={MEAL_MAX}
                    value={cur[m.id] || ""}
                    onChange={(e) => set(q.id, { ...cur, [m.id]: e.target.value })}
                    className="min-h-[54px] rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 text-[16px]"
                  />
                </label>
              );
            })}
          </div>
        )}
      </div>

      {problem && (
        <p role="alert" className="mt-4 text-[15px] text-[var(--alert)]">{problem}</p>
      )}

      {/* nav */}
      <div className="mt-10 flex items-center gap-4 border-t border-[var(--line)] pt-6">
        <button onClick={back} className="text-[15px] text-[var(--ink-2)] hover:text-[var(--ink)]">
          ← Back
        </button>
        <div className="ml-auto flex items-center gap-3">
          {q.optional && (
            <button onClick={() => { set(q.id, ""); next(); }} className="text-[15px] text-[var(--ink-3)] hover:text-[var(--ink)]">
              Skip
            </button>
          )}
          <button
            onClick={next}
            disabled={!answered}
            className="inline-flex min-h-[54px] items-center rounded-full bg-[var(--ink)] px-7 text-[16px] font-semibold text-white shadow-[0_2px_10px_rgba(15,46,61,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#163B4D] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none disabled:hover:translate-y-0"
          >
            {idx === visible.length - 1 ? "Finish →" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
