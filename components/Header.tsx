"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { programs } from "@/lib/programs";
import { conditions } from "@/lib/conditions";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<"programs" | "conditions" | "knowledge" | null>(null);

  // The panel sits below the header, so travelling from a trigger down into it
  // crosses a strip that belongs to neither. Without a grace period the panel
  // closes before the pointer ever arrives.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const openPanel = (name: "programs" | "conditions") => {
    cancelClose();
    setPanel(name);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setPanel(null), 220);
  };

  useEffect(() => cancelClose, []);

  // Escape should always get you out of an open panel.
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel]);

  const close = () => {
    cancelClose();
    setOpen(false);
    setPanel(null);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--ground)]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[80px] w-full max-w-[1240px] items-center justify-between px-6">
        <Link href="/" aria-label="Ozmo Diet Clinic — home" onClick={close}>
          <Logo size={26} />
        </Link>

        {/* desktop nav */}
        <nav
          className="hidden h-full items-center gap-1 lg:flex"
          onMouseLeave={scheduleClose}
          onMouseEnter={cancelClose}
        >
          <button
            className="rounded-md px-3 py-2 text-[15px] font-medium hover:text-[var(--accent-text)]"
            onMouseEnter={() => openPanel("programs")}
            onFocus={() => openPanel("programs")}
            onClick={() => (panel === "programs" ? setPanel(null) : openPanel("programs"))}
            aria-expanded={panel === "programs"}
          >
            Programmes
          </button>
          <button
            className="rounded-md px-3 py-2 text-[15px] font-medium hover:text-[var(--accent-text)]"
            onMouseEnter={() => openPanel("conditions")}
            onFocus={() => openPanel("conditions")}
            onClick={() => (panel === "conditions" ? setPanel(null) : openPanel("conditions"))}
            aria-expanded={panel === "conditions"}
          >
            Conditions
          </button>
          <Link href="/how-it-works" className="rounded-md px-3 py-2 text-[15px] font-medium hover:text-[var(--accent-text)]">
            How It Works
          </Link>
          <Link href="/about" className="rounded-md px-3 py-2 text-[15px] font-medium hover:text-[var(--accent-text)]">
            About
          </Link>
          <Link href="/faq" className="rounded-md px-3 py-2 text-[15px] font-medium hover:text-[var(--accent-text)]">
            FAQs
          </Link>

          <div className="ml-3 flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-[var(--line)] px-5 py-2.5 text-[15px] font-semibold transition-colors hover:border-[var(--ink)]"
            >
              Log in
            </Link>
            <Link
              href="/assessment"
              className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-[15px] font-semibold text-white shadow-[0_2px_10px_rgba(15,46,61,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#163B4D]"
            >
              Start free assessment
            </Link>
          </div>

          {panel && (
            <div
              className="absolute left-0 right-0 top-[80px] border-b border-[var(--line)] bg-[var(--paper)] shadow-[0_12px_28px_rgba(15,46,61,0.08)]"
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <div className="mx-auto grid max-w-[1240px] gap-8 px-6 py-9 md:grid-cols-3">
                {panel === "programs" &&
                  programs.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/programs/${p.slug}`}
                      onClick={close}
                      className="group rounded-lg border border-transparent p-3 transition-colors hover:border-[var(--line)]"
                    >
                      <span className="block text-[16px] font-semibold group-hover:text-[var(--accent-text)]">
                        {p.name}
                      </span>
                      <span className="block text-[14px] text-[var(--ink-2)]">{p.oneLiner}</span>
                    </Link>
                  ))}
                {panel === "conditions" &&
                  conditions.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/conditions/${c.slug}`}
                      onClick={close}
                      className="group rounded-lg border border-transparent p-3 transition-colors hover:border-[var(--line)]"
                    >
                      <span className="block text-[16px] font-semibold group-hover:text-[var(--accent-text)]">
                        {c.name}
                      </span>
                      <span className="block text-[14px] text-[var(--ink-2)]">{c.cardBlurb}</span>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </nav>

        {/* mobile trigger */}
        <button
          className="lg:hidden rounded-md p-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? (
              <>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </>
            ) : (
              <>
                <path d="M3 7h18" />
                <path d="M3 12h18" />
                <path d="M3 17h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="lg:hidden max-h-[calc(100vh-80px)] overflow-y-auto border-t border-[var(--line)] bg-[var(--ground)] px-6 py-6">
          <p className="eyebrow mb-3">Programmes</p>
          <div className="mb-6 grid gap-1">
            {programs.map((p) => (
              <Link key={p.slug} href={`/programs/${p.slug}`} onClick={close} className="py-2 text-[16px]">
                {p.name}
              </Link>
            ))}
          </div>
          <p className="eyebrow mb-3">Conditions</p>
          <div className="mb-6 grid gap-1">
            {conditions.map((c) => (
              <Link key={c.slug} href={`/conditions/${c.slug}`} onClick={close} className="py-2 text-[16px]">
                {c.name}
              </Link>
            ))}
          </div>
          <div className="mb-6 grid gap-1 border-t border-[var(--line)] pt-4">
            <Link href="/how-it-works" onClick={close} className="py-2 text-[16px]">How It Works</Link>
            <Link href="/about" onClick={close} className="py-2 text-[16px]">About Ozmo</Link>
            <Link href="/faq" onClick={close} className="py-2 text-[16px]">FAQs</Link>
            <Link href="/contact" onClick={close} className="py-2 text-[16px]">Contact</Link>
            <Link href="/login" onClick={close} className="py-2 text-[16px]">Client log in</Link>
          </div>
          <Link
            href="/assessment"
            onClick={close}
            className="block rounded-full bg-[var(--ink)] px-5 py-4 text-center text-[15.5px] font-semibold text-white"
          >
            Start Your Free Health Assessment
          </Link>
        </div>
      )}
    </header>
  );
}
