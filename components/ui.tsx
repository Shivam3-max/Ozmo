import Link from "next/link";
import type { ReactNode } from "react";

/* ---------------- buttons ---------------- */

type BtnProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "accent" | "outline" | "onDark" | "ghost";
  size?: "lg" | "md";
  className?: string;
};

export function Button({ href, children, variant = "primary", size = "lg", className = "" }: BtnProps) {
  const base =
    "group inline-flex items-center justify-center gap-2.5 rounded-full font-semibold transition-all duration-200 whitespace-nowrap";
  const sizes = {
    lg: "px-7 py-4 text-[16px] min-h-[56px]",
    md: "px-5 py-3 text-[15px] min-h-[46px]",
  };
  const styles: Record<string, string> = {
    primary:
      "bg-[var(--ink)] text-white hover:bg-[#163B4D] shadow-[0_2px_10px_rgba(15,46,61,0.18)] hover:shadow-[0_8px_24px_rgba(15,46,61,0.24)] hover:-translate-y-0.5",
    accent:
      "bg-[var(--accent)] text-[#0F2E3D] hover:bg-[#ffe04a] shadow-[0_2px_10px_rgba(247,209,23,0.35)] hover:shadow-[0_8px_26px_rgba(247,209,23,0.45)] hover:-translate-y-0.5",
    outline:
      "border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--ink)] hover:-translate-y-0.5",
    onDark: "border border-white/25 text-white hover:bg-white/10 hover:border-white/50",
    ghost: "text-[var(--ink)] hover:text-[var(--accent-text)] !px-0 !min-h-0 !py-1",
  };
  return (
    <Link href={href} className={`${base} ${sizes[size]} ${styles[variant]} ${className}`}>
      {children}
    </Link>
  );
}

/* ---------------- badges & chips ---------------- */

export function Badge({ children, live = false }: { children: ReactNode; live?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-[13.5px] font-medium text-[var(--ink-2)] shadow-[0_1px_3px_rgba(15,46,61,0.05)]">
      {live && (
        <span className="live-dot h-2 w-2 shrink-0 rounded-full bg-[var(--accent)] ring-[3px] ring-[var(--accent)]/25" aria-hidden />
      )}
      {children}
    </span>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-[13.5px] font-medium text-[var(--ink-2)]">
      {children}
    </span>
  );
}

export function Pill({
  children,
  tone = "accent",
}: {
  children: ReactNode;
  tone?: "accent" | "mute" | "good" | "watch" | "alert" | "dark";
}) {
  const tones: Record<string, string> = {
    accent: "bg-[var(--accent)] text-[#0F2E3D]",
    mute: "bg-[var(--tint)] text-[var(--ink-2)] border border-[var(--line)]",
    dark: "bg-[var(--ink)] text-white",
    good: "bg-[var(--good)]/10 text-[var(--good)]",
    watch: "bg-[var(--watch)]/10 text-[var(--watch)]",
    alert: "bg-[var(--alert)]/10 text-[var(--alert)]",
  };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.08em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

/* ---------------- backdrop layers ---------------- */

export function Backdrop({
  variant = "grid",
  dark = false,
}: {
  variant?: "grid" | "washes" | "both" | "none";
  dark?: boolean;
}) {
  if (variant === "none") return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {(variant === "grid" || variant === "both") && (
        <div className={`grid-layer ${dark ? "grid-layer-dark" : ""}`} />
      )}
      {(variant === "washes" || variant === "both") && (
        <>
          <div
            className="wash"
            style={{ width: 620, height: 620, right: "-8%", top: "-22%", background: "var(--wash-a)" }}
          />
          <div
            className="wash"
            style={{ width: 520, height: 520, left: "-12%", bottom: "-30%", background: "var(--wash-b)" }}
          />
        </>
      )}
    </div>
  );
}

/* ---------------- layout ---------------- */

export function Section({
  children,
  tone = "white",
  id,
  className = "",
  backdrop = "none",
}: {
  children: ReactNode;
  tone?: "white" | "tint" | "navy";
  id?: string;
  className?: string;
  backdrop?: "grid" | "washes" | "both" | "none";
}) {
  const tones: Record<string, string> = {
    white: "bg-[var(--ground)]",
    tint: "bg-[var(--tint)]",
    navy: "bg-[#0F2E3D] text-white",
  };
  return (
    <section id={id} className={`relative overflow-hidden ${tones[tone]} py-20 md:py-28 ${className}`}>
      <Backdrop variant={backdrop} dark={tone === "navy"} />
      <div className="relative mx-auto w-full max-w-[1200px] px-6">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = "left",
  onDark = false,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  onDark?: boolean;
  action?: ReactNode;
}) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "mx-auto max-w-[760px] text-center" : "max-w-[900px]"}`}>
      {eyebrow && (
        <p
          className={`text-[12px] font-bold uppercase tracking-[0.18em] ${
            onDark ? "text-[var(--accent)]" : "text-[var(--accent-text)]"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2 className={`${eyebrow ? "mt-5" : ""} text-[clamp(34px,5.2vw,58px)]`}>{title}</h2>
      {lead && (
        <p
          className={`mt-6 text-[clamp(17px,1.6vw,20px)] leading-[1.55] ${
            centered ? "mx-auto max-w-[62ch]" : "max-w-[62ch]"
          } ${onDark ? "text-white/70" : "text-[var(--ink-2)]"}`}
        >
          {lead}
        </p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-7 ${
        hover
          ? "transition-all duration-200 hover:-translate-y-1 hover:border-[var(--ink)]/25 hover:shadow-[0_16px_40px_rgba(15,46,61,0.09)]"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  return (
    <p
      className={`text-[12px] font-bold uppercase tracking-[0.18em] ${
        onDark ? "text-[var(--accent)]" : "text-[var(--accent-text)]"
      }`}
    >
      {children}
    </p>
  );
}

export function Arrow() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform duration-200 group-hover:translate-x-1"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Persistent, undismissable nutrition-not-medicine notice. Required on condition pages. */
export function MedicalNotice() {
  return (
    <div className="flex gap-4 rounded-2xl border border-[var(--line)] bg-[var(--tint)] px-6 py-5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--watch)]/15 text-[var(--watch)]">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="M12 8v5M12 17h.01" />
        </svg>
      </span>
      <p className="text-[15px] leading-relaxed text-[var(--ink-2)]">
        <strong className="font-semibold text-[var(--ink)]">
          This page is nutrition education, not medical advice.
        </strong>{" "}
        Ozmo provides nutrition and lifestyle guidance and does not diagnose or treat medical
        conditions. Please continue to follow your doctor&rsquo;s advice, and never change your
        medication without speaking to them.
      </p>
    </div>
  );
}
