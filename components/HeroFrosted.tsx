"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Arrow } from "@/components/ui";

const WORDS = ["weight loss.", "diabetes.", "PCOS.", "thyroid.", "gut health.", "you."];
const TYPE_MS = 68;
const DELETE_MS = 34;
const HOLD_MS = 1250;

/* ── the dense composition that lives under the glass ───────────────── */

function Chip({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`absolute whitespace-nowrap rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-[13.5px] font-medium text-[var(--ink-2)] shadow-[0_2px_8px_rgba(15,46,61,0.05)] ${className}`}
    >
      {children}
    </span>
  );
}

function Panel({
  children,
  className = "",
  pad = "p-4",
}: {
  children: React.ReactNode;
  className?: string;
  pad?: string;
}) {
  return (
    <div
      className={`absolute rounded-2xl border border-[var(--line)] bg-[var(--paper)] shadow-[0_6px_22px_rgba(15,46,61,0.07)] ${pad} ${className}`}
    >
      {children}
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">{label}</p>
      <p className="tabular mt-1.5 font-[var(--font-display)] text-[26px] font-bold leading-none">
        {value}
      </p>
      {sub && <p className="mt-1.5 text-[12px] font-semibold text-[var(--good)]">{sub}</p>}
    </>
  );
}

function Sparkline() {
  return (
    <svg viewBox="0 0 120 34" className="mt-2 w-full" aria-hidden>
      <polyline
        points="0,6 15,9 30,7 45,14 60,13 75,20 90,19 105,26 120,28"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="120" cy="28" r="3.2" fill="var(--ink)" />
    </svg>
  );
}

function PortraitCard() {
  return (
    <div className="flex items-center gap-3.5">
      <span className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--tint)]">
        <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
          <circle cx="24" cy="18" r="9" fill="#0F2E3D" opacity="0.16" />
          <path d="M6 48c0-10 8-17 18-17s18 7 18 17z" fill="#0F2E3D" opacity="0.16" />
        </svg>
      </span>
      <span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
          Your dietitian
        </span>
        <span className="mt-1 block text-[15px] font-semibold leading-tight">
          Ozmo Diet Clinic
        </span>
      </span>
    </div>
  );
}

function Composition() {
  return (
    <div className="hero-comp">
      {/* conditions — the breadth */}
      <Chip className="inline-flex left-[4%] top-[16%]">Weight loss</Chip>
      <Chip className="left-[15%] top-[71%] hidden sm:inline-flex">Cholesterol</Chip>
      <Chip className="left-[2%] top-[47%] hidden lg:inline-flex">Sports nutrition</Chip>
      <Chip className="inline-flex right-[5%] top-[13%]">Thyroid</Chip>
      <Chip className="right-[3%] top-[62%] hidden sm:inline-flex">Gut health</Chip>
      <Chip className="right-[16%] top-[85%] hidden lg:inline-flex">Weight gain</Chip>
      <Chip className="left-[26%] top-[6%] hidden md:inline-flex">PCOS / PCOD</Chip>
      <Chip className="right-[27%] top-[90%] hidden md:inline-flex">Diabetes</Chip>

      {/* programmes */}
      <Panel className="left-[6%] top-[27%] w-[212px] hidden md:block">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
          Programme
        </p>
        <p className="mt-2 font-[var(--font-display)] text-[19px] font-bold leading-tight">
          Hormonal Balance
        </p>
        <p className="mt-1.5 text-[13px] text-[var(--ink-2)]">3 or 6 months · fortnightly</p>
      </Panel>

      <Panel className="right-[6%] top-[71%] w-[218px] hidden md:block">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
          Programme
        </p>
        <p className="mt-2 font-[var(--font-display)] text-[19px] font-bold leading-tight">
          Metabolic Health
        </p>
        <p className="mt-1.5 text-[13px] text-[var(--ink-2)]">Blood sugar · cholesterol · BP</p>
      </Panel>

      {/* the dashboard — today's plan */}
      <Panel className="left-[13%] top-[46%] w-[248px] hidden lg:block" pad="p-0">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
            Today
          </span>
          <span className="tabular text-[11px] text-[var(--ink-3)]">Day 34 / 90</span>
        </div>
        <ul className="grid gap-2 px-4 py-3.5 text-[13px]">
          {[
            ["8:30", "Vegetable poha + curd", true],
            ["11:00", "Guava · 5 almonds", true],
            ["13:30", "2 roti · dal · sabzi", false],
          ].map(([t, n, done]) => (
            <li key={t as string} className="flex items-center gap-2.5">
              <span className="tabular w-[34px] shrink-0 text-[var(--ink-3)]">{t}</span>
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  done ? "border-[var(--good)] bg-[var(--good)] text-white" : "border-[var(--line)]"
                }`}
                aria-hidden
              >
                {done && (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </span>
              <span className={done ? "text-[var(--ink-3)]" : "font-medium"}>{n}</span>
            </li>
          ))}
        </ul>
      </Panel>

      {/* metrics */}
      <Panel className="right-[13%] top-[27%] w-[152px] hidden lg:block">
        <Metric label="Ozmo Score" value="78" sub="↑ 6 this week" />
      </Panel>

      <Panel className="left-[31%] top-[88%] w-[150px] hidden md:block">
        <Metric label="Adherence" value="82%" />
      </Panel>

      <Panel className="right-[30%] top-[4%] w-[168px] hidden lg:block">
        <Metric label="Weight" value="78.4" sub="↓ 3.6 kg" />
        <Sparkline />
      </Panel>

      <Chip className="left-[45%] top-[94%] hidden lg:inline-flex">HbA1c 6.8 · reviewed</Chip>
      <Chip className="right-[40%] top-[13%] hidden xl:inline-flex">Waist −8 cm</Chip>
    </div>
  );
}

/* ── cards that press through the glass ─────────────────────────────── */

function PressThrough() {
  const items = [
    {
      cls: "left-[7%] top-[24%] w-[236px] hidden md:block",
      delay: "0s",
      body: <PortraitCard />,
    },
    {
      cls: "bottom-[5%] left-1/2 w-[266px] -translate-x-1/2 md:bottom-auto md:left-auto md:right-[7%] md:top-[30%] md:w-[244px] md:translate-x-0",
      delay: "1.2s",
      body: (
        <>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
            A note on your plan
          </p>
          <p className="hero-hand mt-2.5 text-[var(--ink)]">
            Priya — dinner before 8:30 this fortnight. Everything else stays.
          </p>
        </>
      ),
    },
    {
      cls: "left-[11%] top-[70%] w-[224px] hidden lg:block",
      delay: "10.4s",
      body: (
        <>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
            Follow-up booked
          </p>
          <p className="mt-2 font-[var(--font-display)] text-[17px] font-bold leading-tight">
            Fri 12 Sep · 5:30 PM
          </p>
          <p className="mt-1.5 text-[13px] text-[var(--ink-2)]">Fortnightly review</p>
        </>
      ),
    },
    {
      cls: "right-[10%] top-[76%] w-[228px] hidden lg:block",
      delay: "15.6s",
      body: (
        <>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
            Swapped
          </p>
          <p className="mt-2 text-[14px] font-medium leading-snug">
            Paneer → soya chunks
          </p>
          <p className="mt-1.5 text-[13px] text-[var(--ink-2)]">Same protein, cheaper</p>
        </>
      ),
    },
    {
      cls: "left-[36%] top-[4%] w-[212px] hidden xl:block",
      delay: "20.8s",
      body: (
        <>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
            Streak
          </p>
          <p className="mt-2 font-[var(--font-display)] text-[17px] font-bold leading-tight">
            12 days logged
          </p>
        </>
      ),
    },
  ];

  return (
    <>
      {items.map((it) => (
        <div key={it.delay} className={`hero-press-slot ${it.cls}`} aria-hidden>
          <div
            className="hero-press rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 shadow-[0_14px_38px_rgba(15,46,61,0.14)]"
            style={{ animationDelay: it.delay }}
          >
            {it.body}
          </div>
        </div>
      ))}
    </>
  );
}

/* ── the hero ───────────────────────────────────────────────────────── */

export default function HeroFrosted() {
  const [text, setText] = useState("");
  const [settled, setSettled] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(WORDS[WORDS.length - 1]);
      setSettled(true);
      return;
    }

    let word = 0;
    let char = 0;
    let deleting = false;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const target = WORDS[word];
      const last = word === WORDS.length - 1;

      if (!deleting) {
        char += 1;
        setText(target.slice(0, char));
        if (char === target.length) {
          if (last) {
            setSettled(true);
            return;
          }
          deleting = true;
          timer.current = setTimeout(tick, HOLD_MS);
          return;
        }
        timer.current = setTimeout(tick, TYPE_MS);
        return;
      }

      char -= 1;
      setText(target.slice(0, char));
      if (char === 0) {
        deleting = false;
        word += 1;
      }
      timer.current = setTimeout(tick, char === 0 ? 130 : DELETE_MS);
    };

    timer.current = setTimeout(tick, 700);
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <section className="relative flex items-center overflow-hidden border-b border-[var(--line)]"
      style={{ minHeight: "clamp(660px, 88vh, 940px)" }}>
      <Composition />
      <div className="hero-frost" aria-hidden />
      <div className="hero-scrim" aria-hidden />
      <PressThrough />

      <div className="relative z-30 mx-auto w-full max-w-[900px] px-6 pb-56 pt-20 text-center md:pb-20">
        {/* real text for crawlers and screen readers; the animation is decorative */}
        <h1 className="sr-only">
          Ozmo Diet Clinic — personalised nutrition built for weight loss, diabetes, PCOS, thyroid
          and gut health, with daily tracking and a dietitian who stays with you.
        </h1>

        <p
          className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--ink-3)]"
          aria-hidden
        >
          Nutrition built for
        </p>

        <p
          className="mx-auto mt-6 flex min-h-[1.05em] items-center justify-center font-[var(--font-display)] text-[clamp(48px,9.5vw,104px)] font-bold leading-[1.02] tracking-[-0.04em]"
          aria-hidden
        >
          <span>{text}</span>
          {!settled && <span className="caret h-[0.78em]" />}
        </p>

        <div
          className="transition-transform duration-700"
          style={{ transform: settled ? "none" : "translateY(4px)" }}
        >
          <p className="mx-auto mt-8 max-w-[46ch] text-[clamp(16px,1.7vw,19px)] leading-[1.55] text-[var(--ink-2)]">
            Personalised programmes, daily tracking, and a dietitian who stays with you long after
            the plan arrives.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/assessment"
              className="group inline-flex min-h-[56px] items-center gap-2.5 rounded-full bg-[var(--ink)] px-7 text-[16px] font-semibold text-white shadow-[0_2px_10px_rgba(15,46,61,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#163B4D] hover:shadow-[0_8px_24px_rgba(15,46,61,0.24)]"
            >
              Start your free assessment <Arrow />
            </Link>
            <Link
              href="/book"
              className="inline-flex min-h-[56px] items-center rounded-full border border-[var(--line)] bg-[var(--paper)] px-7 text-[16px] font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ink)]"
            >
              Book a consultation
            </Link>
          </div>

          <p className="mt-6 text-[14px] text-[var(--ink-3)]">
            4 minutes · no payment · no obligation
          </p>
        </div>
      </div>
    </section>
  );
}
