"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";

const TABS = [
  { href: "/portal", label: "Today", exact: true, icon: "M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z" },
  { href: "/portal/plan", label: "Plan", icon: "M8 6h12M8 12h12M8 18h12M3.5 6h.01M3.5 12h.01M3.5 18h.01" },
  { href: "/portal/log", label: "Log", icon: "M12 5v14M5 12h14", primary: true },
  { href: "/portal/progress", label: "Progress", icon: "M3 17l6-6 4 4 8-8" },
  { href: "/portal/profile", label: "More", icon: "M4 6h16M4 12h16M4 18h16" },
];

const MORE = [
  { href: "/portal/measurements", label: "Measurements" },
  { href: "/portal/reports", label: "My reports" },
  { href: "/portal/messages", label: "Messages" },
  { href: "/portal/appointments", label: "Appointments" },
  { href: "/portal/profile", label: "Profile & settings" },
];

export default function PortalShell({
  children,
  name,
  unread,
}: {
  children: React.ReactNode;
  name: string;
  unread: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen bg-[var(--tint)] pb-[76px] lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--paper)]">
        <div className="mx-auto flex h-[62px] w-full max-w-[1100px] items-center justify-between px-5">
          <Link href="/portal"><Logo size={22} /></Link>
          <div className="flex items-center gap-3">
            <Link
              href="/portal/messages"
              className="relative rounded-full border border-[var(--line)] px-4 py-2 text-[13.5px] font-semibold hover:border-[var(--ink)]"
            >
              Messages
              {unread > 0 && (
                <span className="tabular absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[11px] font-bold text-[#0F2E3D]">
                  {unread}
                </span>
              )}
            </Link>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
                router.refresh();
              }}
              className="text-[13.5px] text-[var(--ink-3)] hover:text-[var(--ink)]"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1100px]">
        <nav className="hidden w-[210px] shrink-0 py-7 pr-5 lg:block" aria-label="Your dashboard">
          <p className="px-3 pb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">
            {name}
          </p>
          <div className="grid gap-0.5">
            {([
              ...TABS.filter((t) => !t.primary).map((t) => ({ href: t.href, label: t.label, exact: t.exact ?? false })),
              ...MORE.filter((m) => !TABS.some((t) => t.href === m.href)).map((m) => ({ ...m, exact: false })),
            ] as { href: string; label: string; exact: boolean }[]).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-[14.5px] transition-colors ${
                  active(item.href, item.exact)
                    ? "bg-[var(--ink)] font-semibold text-white"
                    : "text-[var(--ink-2)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <main className="min-w-0 flex-1 px-5 py-6 lg:py-8">{children}</main>
      </div>

      {/* mobile tab bar — Log is the most-used action, so it gets the best spot */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--line)] bg-[var(--paper)] lg:hidden"
        aria-label="Your dashboard"
      >
        <div className="mx-auto grid max-w-[520px] grid-cols-5">
          {TABS.map((t) => {
            const on = active(t.href, t.exact);
            if (t.primary) {
              return (
                <Link key={t.href} href={t.href} className="flex items-center justify-center py-2">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-[#0F2E3D] shadow-[0_4px_14px_rgba(247,209,23,0.5)]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                      <path d={t.icon} />
                    </svg>
                  </span>
                </Link>
              );
            }
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
                  on ? "text-[var(--ink)]" : "text-[var(--ink-3)]"
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d={t.icon} />
                </svg>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
