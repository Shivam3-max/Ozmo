"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";

type NavItem = { href: string; label: string; exact?: boolean; roles?: string[] };
type NavSection = { group: string; items: NavItem[] };

const NAV: NavSection[] = [
  {
    group: "Practice",
    items: [
      { href: "/admin", label: "Overview", exact: true },
      { href: "/admin/leads", label: "Leads" },
      { href: "/admin/assessments", label: "Assessments" },
      { href: "/admin/appointments", label: "Appointments" },
      { href: "/admin/clients", label: "Clients" },
    ],
  },
  {
    group: "Care",
    items: [
      { href: "/admin/plans", label: "Diet plans" },
      { href: "/admin/messages", label: "Messages" },
      { href: "/admin/foods", label: "Library" },
      { href: "/admin/enquiries", label: "Enquiries" },
    ],
  },
  {
    group: "Clinic",
    items: [
      { href: "/admin/staff", label: "Staff", roles: ["SUPER_ADMIN"] },
      { href: "/admin/data-requests", label: "Data requests", roles: ["SUPER_ADMIN"] },
      { href: "/admin/notifications", label: "Notifications", roles: ["SUPER_ADMIN"] },
      { href: "/admin/retention", label: "Data retention", roles: ["SUPER_ADMIN"] },
      { href: "/admin/security", label: "Sign-in activity", roles: ["SUPER_ADMIN"] },
      { href: "/admin/account", label: "Your account" },
    ],
  },
];

export default function Shell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; role: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen bg-[var(--tint)]">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--paper)]">
        <div className="flex h-[60px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              className="rounded-md p-2 lg:hidden"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M3 7h18M3 12h18M3 17h18" />
              </svg>
            </button>
            <Link href="/admin" className="flex items-center gap-3">
              <Logo size={20} />
              <span className="hidden text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)] sm:inline">
                Practice
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/admin/account" className="hidden text-right hover:opacity-80 sm:block" title="Your account and password">
              <span className="block text-[13.5px] font-semibold leading-tight">{user.name}</span>
              <span className="block text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
                {user.role.replace(/_/g, " ").toLowerCase()} · account
              </span>
            </Link>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout?scope=staff", { method: "POST" });
                router.push("/admin/login");
                router.refresh();
              }}
              className="rounded-full border border-[var(--line)] px-4 py-2 text-[13.5px] font-semibold transition-colors hover:border-[var(--ink)]"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1500px]">
        <nav
          className={`${open ? "block" : "hidden"} w-full shrink-0 border-b border-[var(--line)] bg-[var(--paper)] px-4 py-4 lg:block lg:w-[220px] lg:border-b-0 lg:border-r lg:px-3 lg:py-6`}
          aria-label="Admin"
        >
          {NAV.map((section) => (
            <div key={section.group} className="mb-6">
              <p className="px-3 pb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">
                {section.group}
              </p>
              <div className="grid gap-0.5">
                {section.items.filter((item) => !item.roles || item.roles.includes(user.role)).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-lg px-3 py-2 text-[14.5px] transition-colors ${
                      active(item.href, item.exact)
                        ? "bg-[var(--ink)] font-semibold text-white"
                        : "text-[var(--ink-2)] hover:bg-[var(--tint)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link
            href="/"
            className="mt-2 block rounded-lg px-3 py-2 text-[13.5px] text-[var(--ink-3)] hover:text-[var(--ink)]"
          >
            View website →
          </Link>
        </nav>

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
