"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";

/** Just what the menus show. The marketing layout (a server component) passes
 * these in, so the full programme and condition content never ships to the browser. */
export type HeaderNav = {
  programs: { slug: string; name: string; oneLiner: string }[];
  conditions: { slug: string; name: string; cardBlurb: string }[];
};

type PanelName = "programs" | "conditions";

export default function Header({ nav }: { nav: HeaderNav }) {
  const { programs, conditions } = nav;
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<PanelName | null>(null);
  const triggers = useRef<Record<PanelName, HTMLButtonElement | null>>({ programs: null, conditions: null });
  const mobileTrigger = useRef<HTMLButtonElement | null>(null);

  // The panel sits below the header, so travelling from a trigger down into it
  // crosses a strip that belongs to neither. Without a grace period the panel
  // closes before the pointer ever arrives.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const openPanel = (name: PanelName) => {
    cancelClose();
    setPanel(name);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setPanel(null), 220);
  };

  useEffect(() => cancelClose, []);

  // Escape closes the open menu and puts focus back on its button, so keyboard
  // users aren't dropped at the top of the page.
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const trigger = triggers.current[panel];
      setPanel(null);
      trigger?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      mobileTrigger.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    cancelClose();
    setOpen(false);
    setPanel(null);
  };

  /** Closes a menu once keyboard focus moves outside its button and panel. */
  const closeOnFocusOut = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPanel(null);
  };

  const menu = (name: PanelName, label: string, items: { href: string; title: string; blurb: string }[]) => (
    <div onBlur={closeOnFocusOut} className="flex h-full items-center">
      <button
        ref={(el) => { triggers.current[name] = el; }}
        type="button"
        className="rounded-md px-3 py-2 text-[15px] font-medium hover:text-[var(--accent-text)]"
        onMouseEnter={() => openPanel(name)}
        onClick={() => (panel === name ? setPanel(null) : openPanel(name))}
        aria-expanded={panel === name}
        aria-controls={`menu-${name}`}
      >
        {label}
      </button>
      {panel === name && (
        <div
          id={`menu-${name}`}
          className="absolute left-0 right-0 top-[80px] border-b border-[var(--line)] bg-[var(--paper)] shadow-[0_12px_28px_rgba(15,46,61,0.08)]"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <ul className="mx-auto grid max-w-[1240px] gap-8 px-6 py-9 md:grid-cols-3">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="group block rounded-lg border border-transparent p-3 transition-colors hover:border-[var(--line)]"
                >
                  <span className="block text-[16px] font-semibold group-hover:text-[var(--accent-text)]">{item.title}</span>
                  <span className="block text-[14px] text-[var(--ink-2)]">{item.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--ground)]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[80px] w-full max-w-[1240px] items-center justify-between px-6">
        <Link href="/" aria-label="Ozmo Diet Clinic — home" onClick={close}>
          <Logo size={26} />
        </Link>

        {/* desktop nav */}
        <nav
          aria-label="Main"
          className="hidden h-full items-center gap-1 lg:flex"
          onMouseLeave={scheduleClose}
          onMouseEnter={cancelClose}
        >
          {menu("programs", "Programmes", programs.map((p) => ({ href: `/programs/${p.slug}`, title: p.name, blurb: p.oneLiner })))}
          {menu("conditions", "Conditions", conditions.map((c) => ({ href: `/conditions/${c.slug}`, title: c.name, blurb: c.cardBlurb })))}
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
        </nav>

        {/* mobile trigger */}
        <button
          ref={mobileTrigger}
          type="button"
          className="lg:hidden rounded-md p-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
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
        <nav id="mobile-menu" aria-label="Main" className="lg:hidden max-h-[calc(100vh-80px)] overflow-y-auto border-t border-[var(--line)] bg-[var(--ground)] px-6 py-6">
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
        </nav>
      )}
    </header>
  );
}
