"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  questions,
  steps,
  mealSlots,
  type Answers,
  computeBmi,
  bmiBand,
  buildCards,
  buildFocus,
  recommendProgram,
  requiresMedicalCaution,
} from "@/lib/assessment";

const STORAGE = "ozmo.assessment.v1";

const goalFromParam: Record<string, string> = {
  "lose-weight": "Lose weight",
  condition: "Manage a health condition",
  "gain-weight": "Gain weight",
  fitness: "Build fitness or muscle",
  wellness: "Feel better overall",
};

function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold text-[var(--ink)]">{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export default function AssessmentFlow() {
  const params = useSearchParams();
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const [contact, setContact] = useState({ email: "", phone: "", city: "", consent: false, marketing: false });
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // restore
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.answers) setAnswers(saved.answers);
        if (typeof saved.idx === "number") setIdx(saved.idx);
        if (saved.started) setStarted(true);
      }
    } catch {
      /* storage unavailable — the flow still works, it just won't resume */
    }
    const g = params.get("goal");
    if (g && goalFromParam[g]) {
      setAnswers((a) => ({ ...a, goal: goalFromParam[g] }));
      setStarted(true);
    }
    setHydrated(true);
  }, [params]);

  // persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify({ answers, idx, started }));
    } catch {
      /* ignore */
    }
  }, [answers, idx, started, hydrated]);

  const visible = useMemo(() => questions.filter((q) => !q.showIf || q.showIf(answers)), [answers]);
  const q = visible[idx];
  const pct = Math.round(((idx + 1) / (visible.length + 1)) * 100);

  const set = (id: string, v: Answers[string]) => setAnswers((a) => ({ ...a, [id]: v }));

  const answered = (() => {
    if (!q) return false;
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

  /* ---------- snapshot ---------- */
  if (showSnapshot) {
    const bmi = computeBmi(answers);
    const cards = buildCards(answers);
    const focus = buildFocus(answers);
    const rec = recommendProgram(answers);
    const caution = requiresMedicalCaution(answers);
    const name = (answers.name as string) || "there";

    return (
      <div className="relative mx-auto w-full max-w-[940px] px-6 py-16 md:py-24">
        <p className="eyebrow">Your Ozmo Health Snapshot</p>
        <h1 className="mt-5 text-[clamp(36px,5.4vw,58px)] leading-[0.99]">Prepared for {name}</h1>
        <p className="mt-2 text-[14.5px] text-[var(--ink-3)]">
          {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--tint)] px-6 py-5">
          <p className="text-[14.5px] leading-relaxed text-[var(--ink-2)]">
            This snapshot is a summary of the answers you gave us. It is not a medical assessment and
            does not diagnose anything. It&rsquo;s a starting point for a conversation.
          </p>
        </div>

        {/* numbers */}
        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-4">
          {[
            { l: "Current weight", v: answers.weight ? `${answers.weight} kg` : "—", s: "" },
            { l: "BMI", v: bmi ? String(bmi) : "—", s: bmi ? bmiBand(bmi) : "" },
            { l: "Goal", v: (answers.goal as string) || "—", s: "From your answers" },
            { l: "Activity", v: ((answers.activity as string) || "—").split(" — ")[0], s: "Based on your routine" },
          ].map((t) => (
            <div key={t.l} className="bg-[var(--paper)] px-4 py-4">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">{t.l}</p>
              <p className="tabular mt-2.5 font-[var(--font-display)] text-[28px] font-bold leading-tight">{t.v}</p>
              {t.s && <p className="mt-1.5 text-[12.5px] leading-snug text-[var(--ink-2)]">{t.s}</p>}
            </div>
          ))}
        </div>
        <p className="mt-3 max-w-[70ch] text-[13.5px] leading-relaxed text-[var(--ink-3)]">
          BMI is a rough screening number, not a verdict. It doesn&rsquo;t distinguish muscle from fat
          and it doesn&rsquo;t know your body — we use Asian-Indian cut-offs, and your dietitian will
          measure properly at your consultation.
        </p>

        {/* cards */}
        {cards.length > 0 && (
          <>
            <h2 className="mt-16 text-[clamp(28px,4vw,42px)]">What stands out</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {cards.map((c) => (
                <div key={c.heading} className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-7">
                  <h3 className="text-[20px]">{c.heading}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--ink-2)]">{c.body}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* focus */}
        <h2 className="mt-16 text-[clamp(28px,4vw,42px)]">What we&rsquo;d focus on first</h2>
        <ol className="mt-6 grid gap-3">
          {focus.map((f, i) => (
            <li key={i} className="flex gap-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-6 py-5">
              <span className="tabular font-[var(--font-display)] text-[15px] font-bold text-[var(--accent-text)]">
                {i + 1}
              </span>
              <span className="text-[16px] leading-relaxed text-[var(--ink-2)]">
                <Rich text={f} />
              </span>
            </li>
          ))}
        </ol>

        {/* recommendation + CTA */}
        {caution ? (
          <div className="mt-16 rounded-2xl border border-[var(--alert)]/25 bg-[var(--alert)]/6 px-8 py-8">
            <h2 className="text-[24px]">Please speak to your doctor first</h2>
            <p className="mt-3 max-w-[62ch] text-[16px] leading-relaxed text-[var(--ink-2)]">
              Based on what you&rsquo;ve told us, we&rsquo;d want your doctor involved before starting
              any nutrition programme. That&rsquo;s not us turning you away — it&rsquo;s us doing this
              properly. Bring their guidance to your consultation and we&rsquo;ll build around it.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/book" className="inline-flex min-h-[54px] items-center rounded-full bg-[var(--ink)] px-7 text-[16px] font-semibold text-white">
                Book a consultation
              </Link>
              <Link href="/medical-disclaimer" className="inline-flex min-h-[54px] items-center rounded-full border border-[var(--line)] px-7 text-[16px] font-semibold">
                Read our medical disclaimer
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative mt-16 overflow-hidden rounded-[26px] bg-[#0F2E3D] px-9 py-10 text-white"><span className="grid-layer grid-layer-dark" aria-hidden />
            <p className="eyebrow !text-white/45">Recommended programme</p>
            <h2 className="relative mt-4 text-[clamp(30px,4.2vw,44px)]">{rec.name}</h2>
            <p className="relative mt-5 max-w-[58ch] text-[17px] leading-relaxed text-white/70">
              Based on your answers, we&rsquo;d suggest starting here. A consultation is where it gets
              real — your dietitian will go through your reports, your routine and your history
              properly, and build a plan around it.
            </p>
            <div className="relative mt-9 flex flex-wrap gap-3">
              <Link href="/book" className="inline-flex min-h-[54px] items-center rounded-full bg-[var(--accent)] px-7 text-[16px] font-semibold text-[#0F2E3D] transition-transform duration-200 hover:-translate-y-0.5">
                Book your consultation →
              </Link>
              <Link href={`/programs/${rec.slug}`} className="inline-flex min-h-[54px] items-center rounded-full border border-white/25 px-7 text-[16px] font-semibold transition-colors hover:bg-white/10">
                Learn more
              </Link>
            </div>
            <p className="relative mt-6 text-[14px] text-white/55">
              No obligation. If we don&rsquo;t think we&rsquo;re the right fit for you, we&rsquo;ll tell you.
            </p>
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-3 border-t border-[var(--line)] pt-8">
          <button onClick={() => window.print()} className="rounded-full border border-[var(--line)] px-5 py-3 text-[14.5px] font-medium transition-colors hover:border-[var(--ink)]">
            Print or save as PDF
          </button>
          <button
            onClick={() => {
              try { localStorage.removeItem(STORAGE); } catch {}
              setAnswers({}); setIdx(0); setDone(false); setShowSnapshot(false); setStarted(false);
            }}
            className="rounded-full border border-[var(--line)] px-5 py-3 text-[14.5px] font-medium transition-colors hover:border-[var(--ink)]"
          >
            Retake the assessment
          </button>
        </div>
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
          onSubmit={(e) => {
            e.preventDefault();
            setShowSnapshot(true);
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

          <button
            type="submit"
            className="mt-3 inline-flex min-h-[56px] items-center justify-center rounded-full bg-[var(--ink)] px-8 text-[16px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#163B4D]"
          >
            See my Snapshot →
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
    <div className="relative mx-auto w-full max-w-[760px] px-6 py-12 md:py-16">
      {/* progress */}
      <div className="sticky top-[72px] z-10 -mx-6 mb-10 bg-[var(--ground)] px-6 pb-4 pt-3">
        <div className="flex items-baseline justify-between text-[13px] text-[var(--ink-3)]">
          <span className="font-bold uppercase tracking-[0.1em]">
            Step {q.step} of 7 · {step.title}
          </span>
          <span className="tabular">
            {idx + 1} / {visible.length}
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

      <h1 className="text-[clamp(28px,4.2vw,44px)] leading-[1.04]">{q.label}</h1>
      {q.helper && <p className="mt-3 text-[15.5px] leading-relaxed text-[var(--ink-2)]">{q.helper}</p>}

      <div className="mt-8">
        {/* text / number */}
        {(q.type === "text" || q.type === "number") && (
          <input
            type={q.type === "number" ? "number" : "text"}
            inputMode={q.type === "number" ? "numeric" : "text"}
            min={q.min}
            max={q.max}
            autoFocus
            placeholder={q.placeholder}
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
              placeholder={q.type === "height" ? "e.g. 168" : "e.g. 78"}
              value={(answers[q.id] as string) || ""}
              onChange={(e) => set(q.id, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && answered) next(); }}
              className="min-h-[60px] w-[190px] rounded-xl border border-[var(--line)] bg-[var(--paper)] px-5 text-[19px]"
            />
            <span className="text-[16px] font-medium text-[var(--ink-2)]">
              {q.type === "height" ? "cm" : "kg"}
            </span>
          </div>
        )}

        {/* textarea */}
        {q.type === "textarea" && (
          <textarea
            rows={q.id === "blocker" ? 6 : 3}
            autoFocus
            placeholder={q.placeholder}
            value={(answers[q.id] as string) || ""}
            onChange={(e) => set(q.id, e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] p-5 text-[16.5px] leading-relaxed"
          />
        )}

        {/* single */}
        {q.type === "single" && (
          <div className="grid gap-2.5">
            {q.options!.map((o) => {
              const on = answers[q.id] === o;
              return (
                <button
                  key={o}
                  onClick={() => { set(q.id, o); setTimeout(() => (idx < visible.length - 1 ? setIdx(idx + 1) : setDone(true)), 160); }}
                  className={`rounded-xl border px-6 py-4.5 text-left text-[17px] transition-all duration-150 hover:-translate-y-0.5 ${
                    on
                      ? "border-[var(--ink)] bg-[var(--accent)]/15 font-semibold"
                      : "border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)]"
                  }`}
                  aria-pressed={on}
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
            <div className="grid gap-2.5 sm:grid-cols-2">
              {q.options!.map((o) => {
                const cur = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
                const on = cur.includes(o);
                return (
                  <button
                    key={o}
                    onClick={() => toggleMulti(q.id, o, q.exclusive)}
                    className={`rounded-xl border px-5 py-4 text-left text-[16px] transition-all duration-150 hover:-translate-y-0.5 ${
                      on
                        ? "border-[var(--ink)] bg-[var(--accent)]/15 font-semibold"
                        : "border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)]"
                    }`}
                    aria-pressed={on}
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

      {/* nav */}
      <div className="mt-10 flex items-center gap-4 border-t border-[var(--line)] pt-6">
        <button onClick={back} className="text-[15px] text-[var(--ink-2)] hover:text-[var(--ink)]">
          ← Back
        </button>
        <div className="ml-auto flex items-center gap-3">
          {q.optional && (
            <button onClick={next} className="text-[15px] text-[var(--ink-3)] hover:text-[var(--ink)]">
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
