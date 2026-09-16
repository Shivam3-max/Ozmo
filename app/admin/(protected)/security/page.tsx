import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { AUTH_EVENTS } from "@/lib/security-audit";
import { formatClinic } from "@/lib/clinic-time";
import { Empty, Flag, PageTitle, Panel, th, td } from "@/components/admin/ui";
import { can } from "@/lib/policy";

export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = {
  LOGIN_SUCCEEDED: "Signed in",
  LOGIN_FAILED: "Failed sign-in",
  LOGIN_BLOCKED: "Blocked while locked",
  ACCOUNT_LOCKED: "Account locked",
  LOGOUT: "Signed out",
  LOGOUT_EVERYWHERE: "Signed out everywhere",
  PORTAL_INVITE_ISSUED: "Portal invite issued",
  PORTAL_RESET_ISSUED: "Portal reset issued",
  PORTAL_PASSWORD_SET: "Portal password set",
  PORTAL_PASSWORD_RESET: "Portal password reset",
  PASSWORD_CHANGED: "Password changed",
  PASSWORD_CHANGE_FAILED: "Wrong current password",
  STAFF_CREATED: "Staff account added",
  STAFF_DISABLED: "Staff account disabled",
  STAFF_ENABLED: "Staff account enabled",
  STAFF_UPDATED: "Staff account changed",
  STAFF_RESET_ISSUED: "Staff reset link issued",
  STAFF_INVITE_REISSUED: "Staff setup link reissued",
  STAFF_PASSWORD_SET: "Staff password set",
  STAFF_PASSWORD_RESET: "Staff password reset",
};

const REASON: Record<string, string> = {
  unknown_account: "no such account",
  wrong_password: "wrong password",
  no_password_yet: "account has no password yet",
  inactive: "account disabled",
  not_staff: "client tried the staff sign-in",
};

const ACCOUNT_EVENTS = [
  "PORTAL_INVITE_ISSUED", "PORTAL_RESET_ISSUED", "PORTAL_PASSWORD_SET", "PORTAL_PASSWORD_RESET",
  "PASSWORD_CHANGED", "PASSWORD_CHANGE_FAILED",
  "STAFF_CREATED", "STAFF_DISABLED", "STAFF_ENABLED", "STAFF_UPDATED", "STAFF_RESET_ISSUED", "STAFF_INVITE_REISSUED",
  "STAFF_PASSWORD_SET", "STAFF_PASSWORD_RESET",
];
const EVENTS = [...AUTH_EVENTS, ...ACCOUNT_EVENTS];

export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const user = await requireStaff();
  if (!can(user.role, "security.read")) {
    return (
      <Panel className="px-6 py-8">
        <p className="text-[15px] text-[var(--ink-2)]">Only the clinic administrator can review sign-in activity.</p>
      </Panel>
    );
  }

  const { view = "problems" } = await searchParams;
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const problemActions = [
    "LOGIN_FAILED", "LOGIN_BLOCKED", "ACCOUNT_LOCKED", "PORTAL_RESET_ISSUED", "PORTAL_PASSWORD_RESET",
    "PASSWORD_CHANGE_FAILED", "STAFF_CREATED", "STAFF_DISABLED", "STAFF_UPDATED", "STAFF_RESET_ISSUED", "LOGOUT_EVERYWHERE",
  ];

  const [events, counts] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        clinicId: user.clinicId,
        createdAt: { gte: since },
        action: { in: view === "all" ? EVENTS : problemActions },
      },
      include: { actor: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    prisma.auditLog.groupBy({
      by: ["action"],
      where: { clinicId: user.clinicId, createdAt: { gte: since }, action: { in: EVENTS } },
      _count: { _all: true },
    }),
  ]);

  const count = (action: string) => counts.find((c) => c.action === action)?._count._all ?? 0;
  const tabs = [
    { key: "problems", label: "Needs a look" },
    { key: "all", label: "Everything" },
  ];

  return (
    <>
      <PageTitle
        title="Sign-in activity"
        sub={`Last 14 days · ${count("LOGIN_FAILED")} failed · ${count("ACCOUNT_LOCKED")} lockouts · ${count("LOGIN_SUCCEEDED")} successful`}
      />
      <p className="mb-5 max-w-[70ch] text-[14px] leading-relaxed text-[var(--ink-2)]">
        Review this weekly. A run of failures on one account, sign-ins from unfamiliar addresses, or a reset you
        didn&rsquo;t issue are worth a call to that person. Unknown accounts are shown without the email typed, by design.
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/security?view=${t.key}`}
            className={`rounded-full px-3.5 py-2 text-[13px] font-semibold ${
              view === t.key ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <Panel>
        {events.length === 0 ? (
          <Empty title="Nothing to review" body="Failed sign-ins, lockouts and password resets from the last 14 days appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>When</th>
                  <th className={th}>Event</th>
                  <th className={th}>Account</th>
                  <th className={th}>Address</th>
                  <th className={th}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => {
                  const changes = (e.changes ?? {}) as { scope?: string; reason?: string; lockedMinutes?: number };
                  const bad = e.action === "ACCOUNT_LOCKED" || e.action === "LOGIN_BLOCKED";
                  return (
                    <tr key={e.id}>
                      <td className={`${td} tabular whitespace-nowrap`}>
                        {formatClinic(e.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className={`${td} whitespace-nowrap`}>
                        {bad ? <Flag tone="alert">{LABEL[e.action]}</Flag> : e.action === "LOGIN_FAILED" ? <Flag tone="watch">{LABEL[e.action]}</Flag> : LABEL[e.action] ?? e.action}
                      </td>
                      <td className={td}>
                        {e.actor ? (
                          <>
                            <span className="font-semibold">{e.actor.name}</span>
                            <span className="block text-[12.5px] text-[var(--ink-3)]">{e.actor.email} · {e.actor.role.toLowerCase().replace("_", " ")}</span>
                          </>
                        ) : (
                          <span className="text-[var(--ink-3)]">Unknown {changes.scope === "client" ? "client" : "staff"} account</span>
                        )}
                      </td>
                      <td className={`${td} tabular text-[13px]`}>{e.ipAddress ?? "—"}</td>
                      <td className={`${td} text-[13px] text-[var(--ink-2)]`}>
                        {changes.reason ? REASON[changes.reason] ?? changes.reason : ""}
                        {changes.lockedMinutes ? `locked for ${changes.lockedMinutes} min` : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
