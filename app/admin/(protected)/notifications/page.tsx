import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { can } from "@/lib/policy";
import { formatClinic } from "@/lib/clinic-time";
import { pageFrom, pageInfo, paging } from "@/lib/pagination";
import { emailConfigured } from "@/lib/notifications/mailer";
import { LINK_KINDS, clinicInbox } from "@/lib/notifications/outbox";
import { Empty, Flag, PageTitle, Panel, th, td } from "@/components/admin/ui";
import Pager from "@/components/admin/Pager";
import RetryNotification from "@/components/admin/RetryNotification";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const KIND: Record<string, string> = {
  PORTAL_INVITE: "Portal invite",
  PORTAL_RESET: "Portal password reset",
  STAFF_INVITE: "Staff setup link",
  STAFF_RESET: "Staff password reset",
  APPOINTMENT_SCHEDULED: "Appointment details",
  APPOINTMENT_LINK: "Video call link",
  BOOKING_RECEIVED: "Booking received",
  SNAPSHOT_READY: "Snapshot link",
  REPORT_READY: "Progress report ready",
  CLINIC_ALERT: "Alert to the clinic",
};

const VIEWS = [
  { key: "problems", label: "Not sent", where: { status: { in: ["FAILED", "SKIPPED", "QUEUED"] } } },
  { key: "all", label: "Everything", where: {} },
] satisfies { key: string; label: string; where: Prisma.NotificationWhereInput }[];

/** Hides most of an address — this page is about delivery, not who the clinic's clients are. */
const maskEmail = (address: string) => {
  const [local, domain] = address.split("@");
  return domain ? `${local.slice(0, 2)}${"•".repeat(Math.max(1, Math.min(6, local.length - 2)))}@${domain}` : address;
};

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ view?: string; page?: string }> }) {
  const user = await requireStaff();
  if (!can(user.role, "notifications.manage")) {
    return (
      <Panel className="px-6 py-8">
        <p className="text-[15px] text-[var(--ink-2)]">Only the clinic administrator can review outgoing email.</p>
      </Panel>
    );
  }

  const { view: rawView, page: rawPage } = await searchParams;
  const view = VIEWS.find((v) => v.key === rawView) ?? VIEWS[0];
  const page = pageFrom(rawPage);
  const where = { clinicId: user.clinicId, ...view.where };
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [rows, total, counts] = await Promise.all([
    prisma.notification.findMany({
      where,
      select: { id: true, kind: true, recipient: true, subject: true, status: true, attempts: true, lastError: true, createdAt: true, sentAt: true },
      orderBy: { createdAt: "desc" },
      ...paging(page, PAGE_SIZE),
    }),
    prisma.notification.count({ where }),
    prisma.notification.groupBy({ by: ["status"], where: { clinicId: user.clinicId, createdAt: { gte: since } }, _count: { _all: true } }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;
  const configured = emailConfigured();

  return (
    <>
      <PageTitle
        title="Notifications"
        sub={`Last 7 days · ${count("SENT")} sent · ${count("FAILED")} failed · ${count("SKIPPED")} not sent`}
      />

      {!configured && (
        <Panel className="mb-5 px-5 py-4">
          <p className="text-[14px] leading-relaxed text-[var(--ink-2)]">
            <strong className="font-semibold text-[var(--ink)]">Email sending isn&rsquo;t set up.</strong> Invites, appointment
            details and booking confirmations are recorded here but not sent. Add <code>SMTP_HOST</code>, <code>EMAIL_FROM</code> and
            the SMTP login to the server environment, then try them again.
          </p>
        </Panel>
      )}
      {configured && !clinicInbox() && (
        <p className="mb-5 max-w-[70ch] text-[14px] leading-relaxed text-[var(--ink-2)]">
          Alerts about new bookings, assessments and enquiries are off. Set <code>CLINIC_NOTIFY_EMAIL</code> to receive them.
        </p>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {VIEWS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/notifications?view=${t.key}`}
            aria-current={view.key === t.key ? "page" : undefined}
            className={`rounded-full px-3.5 py-2 text-[13px] font-semibold ${
              view.key === t.key ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <Panel>
        {rows.length === 0 ? (
          <Empty title="Nothing waiting" body="Emails that failed or weren't sent appear here, so nobody misses an invite or a video link." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>When</th>
                  <th className={th}>Email</th>
                  <th className={th}>To</th>
                  <th className={th}>Status</th>
                  <th className={th}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((n) => (
                  <tr key={n.id}>
                    <td className={`${td} tabular whitespace-nowrap`}>
                      {formatClinic(n.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className={td}>
                      <span className="font-semibold">{KIND[n.kind] ?? n.kind}</span>
                      <span className="block text-[12.5px] text-[var(--ink-3)]">{n.subject}</span>
                    </td>
                    <td className={`${td} text-[13px]`}>{maskEmail(n.recipient)}</td>
                    <td className={`${td} whitespace-nowrap`}>
                      {n.status === "SENT" ? (
                        <Flag tone="good">Sent</Flag>
                      ) : n.status === "FAILED" ? (
                        <Flag tone="alert">Failed</Flag>
                      ) : (
                        <Flag tone="watch">{n.status === "SKIPPED" ? "Not sent" : "Queued"}</Flag>
                      )}
                      {n.lastError && n.status !== "SENT" && (
                        <span className="mt-1 block max-w-[28ch] whitespace-normal text-[12px] text-[var(--ink-3)]">{n.lastError}</span>
                      )}
                    </td>
                    <td className={td}>
                      {n.status === "SENT" ? null : LINK_KINDS.includes(n.kind) ? (
                        <span className="text-[12.5px] text-[var(--ink-3)]">Issue a new link instead</span>
                      ) : (
                        <RetryNotification id={n.id} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <Pager info={pageInfo(page, PAGE_SIZE, total)} base="/admin/notifications" params={{ view: view.key }} noun="emails" />
    </>
  );
}
