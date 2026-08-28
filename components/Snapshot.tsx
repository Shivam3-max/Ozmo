import Link from "next/link";
import { Arrow } from "@/components/ui";
import { bmiBand } from "@/lib/assessment";

export type SnapshotCard = { heading: string; body: string };

export type SnapshotData = {
  name: string;
  weightKg: number | null;
  bmi: number | null;
  goal: string | null;
  activity: string | null;
  cards: SnapshotCard[];
  focus: string[];
  program: { slug: string; name: string; sub?: string } | null;
  caution: boolean;
  preparedAt: Date;
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

export default function Snapshot({ data }: { data: SnapshotData }) {
  const tiles = [
    { l: "Current weight", v: data.weightKg ? `${data.weightKg} kg` : "—", s: "" },
    { l: "BMI", v: data.bmi ? String(data.bmi) : "—", s: data.bmi ? bmiBand(data.bmi) : "" },
    { l: "Goal", v: data.goal ?? "—", s: "From your answers" },
    { l: "Activity", v: (data.activity ?? "—").split(" — ")[0], s: "Based on your routine" },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[940px] px-6 py-16 md:py-24">
      <p className="eyebrow">Your Ozmo Health Snapshot</p>
      <h1 className="mt-5 text-[clamp(36px,5.4vw,58px)] leading-[0.99]">Prepared for {data.name}</h1>
      <p className="mt-3 text-[14.5px] text-[var(--ink-3)]">
        {data.preparedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--tint)] px-6 py-5">
        <p className="text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          This snapshot is a summary of the answers you gave us. It is not a medical assessment and
          does not diagnose anything. It&rsquo;s a starting point for a conversation.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-4">
        {tiles.map((t) => (
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

      {data.cards.length > 0 && (
        <>
          <h2 className="mt-16 text-[clamp(28px,4vw,42px)]">What stands out</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {data.cards.map((c) => (
              <div key={c.heading} className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-7">
                <h3 className="text-[20px]">{c.heading}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--ink-2)]">{c.body}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="mt-16 text-[clamp(28px,4vw,42px)]">What we&rsquo;d focus on first</h2>
      <ol className="mt-8 grid gap-3">
        {data.focus.map((f, i) => (
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

      {data.caution ? (
        <div className="mt-16 rounded-2xl border border-[var(--alert)]/25 bg-[var(--alert)]/6 px-8 py-8">
          <h2 className="text-[24px]">Please speak to your doctor first</h2>
          <p className="mt-3 max-w-[62ch] text-[16px] leading-relaxed text-[var(--ink-2)]">
            Based on what you&rsquo;ve told us, we&rsquo;d want your doctor involved before starting
            any nutrition programme. That&rsquo;s not us turning you away — it&rsquo;s us doing this
            properly. Bring their guidance to your consultation and we&rsquo;ll build around it.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/book" className="inline-flex min-h-[54px] items-center rounded-full bg-[var(--ink)] px-7 text-[16px] font-semibold text-white">
              Book a consultation
            </Link>
            <Link href="/medical-disclaimer" className="inline-flex min-h-[54px] items-center rounded-full border border-[var(--line)] px-7 text-[16px] font-semibold">
              Read our medical disclaimer
            </Link>
          </div>
        </div>
      ) : (
        data.program && (
          <div className="relative mt-16 overflow-hidden rounded-[26px] bg-[#0F2E3D] px-9 py-10 text-white">
            <span className="grid-layer grid-layer-dark" aria-hidden />
            <p className="relative text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
              Recommended programme
            </p>
            <h2 className="relative mt-4 text-[clamp(30px,4.2vw,44px)]">{data.program.name}</h2>
            <p className="relative mt-5 max-w-[58ch] text-[17px] leading-relaxed text-white/70">
              Based on your answers, we&rsquo;d suggest starting here. A consultation is where it gets
              real — your dietitian will go through your reports, your routine and your history
              properly, and build a plan around it.
            </p>
            <div className="relative mt-9 flex flex-wrap gap-3">
              <Link href="/book" className="inline-flex min-h-[54px] items-center gap-2.5 rounded-full bg-[var(--accent)] px-7 text-[16px] font-semibold text-[#0F2E3D]">
                Book your consultation <Arrow />
              </Link>
              <Link href={`/programs/${data.program.slug}`} className="inline-flex min-h-[54px] items-center rounded-full border border-white/25 px-7 text-[16px] font-semibold">
                Learn more
              </Link>
            </div>
            <p className="relative mt-6 text-[14px] text-white/55">
              No obligation. If we don&rsquo;t think we&rsquo;re the right fit for you, we&rsquo;ll tell you.
            </p>
          </div>
        )
      )}

      <div className="mt-10 flex flex-wrap gap-3 border-t border-[var(--line)] pt-8">
        <Link href="/assessment" className="rounded-full border border-[var(--line)] px-5 py-3 text-[14.5px] font-medium transition-colors hover:border-[var(--ink)]">
          Retake the assessment
        </Link>
        <Link href="/contact" className="rounded-full border border-[var(--line)] px-5 py-3 text-[14.5px] font-medium transition-colors hover:border-[var(--ink)]">
          Ask us a question
        </Link>
      </div>
    </div>
  );
}
