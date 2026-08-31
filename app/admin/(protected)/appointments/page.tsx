import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { PageTitle, Panel, Flag, Empty, timeAgo } from "@/components/admin/ui";
import AppointmentActions from "@/components/admin/AppointmentActions";

export const dynamic = "force-dynamic";

const IST = "Asia/Kolkata";

function dayKey(d: Date) {
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: IST });
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  await requireStaff();
  const { view = "upcoming" } = await searchParams;

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const appointments = await prisma.appointment.findMany({
    where:
      view === "past"
        ? { scheduledAt: { lt: startOfToday } }
        : view === "attention"
        ? { status: { in: ["SCHEDULED"] }, scheduledAt: { lt: now } }
        : { scheduledAt: { gte: startOfToday } },
    orderBy: { scheduledAt: view === "past" ? "desc" : "asc" },
    take: 120,
    include: { lead: true, client: { include: { user: true } }, dietitian: true },
  });

  // Anything still "scheduled" after its time has passed needs marking off.
  const overdue = await prisma.appointment.count({
    where: { status: "SCHEDULED", scheduledAt: { lt: now } },
  });

  const grouped = appointments.reduce<Record<string, typeof appointments>>((acc, a) => {
    const k = dayKey(a.scheduledAt);
    (acc[k] ||= []).push(a);
    return acc;
  }, {});

  const tabs = [
    { key: "upcoming", label: "Upcoming" },
    { key: "attention", label: `Needs marking off${overdue ? ` (${overdue})` : ""}` },
    { key: "past", label: "Past" },
  ];

  return (
    <>
      <PageTitle
        title="Appointments"
        sub={`${appointments.length} shown${overdue ? ` · ${overdue} past their time and still marked scheduled` : ""}`}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/appointments?view=${t.key}`}
            className={`rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors ${
              view === t.key
                ? "bg-[var(--ink)] text-white"
                : "border border-[var(--line)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {appointments.length === 0 ? (
        <Panel>
          <Empty
            title={view === "past" ? "Nothing in the past" : view === "attention" ? "Nothing waiting" : "Nothing booked"}
            body="Consultations booked from the website land here automatically, with the client's reason and any notes they left."
          />
        </Panel>
      ) : (
        <div className="grid gap-5">
          {Object.entries(grouped).map(([day, items]) => (
            <div key={day}>
              <h2 className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--accent-text)]">{day}</h2>
              <Panel>
                <ul className="divide-y divide-[var(--line-soft)]">
                  {items.map((a) => {
                    const who = a.client?.user.name ?? a.lead?.name ?? "Unnamed";
                    const phone = a.client?.user.phone ?? a.lead?.phone;
                    const href = a.clientId ? `/admin/clients/${a.clientId}` : a.leadId ? `/admin/leads/${a.leadId}` : null;
                    const isOverdue = a.status === "SCHEDULED" && a.scheduledAt < now;
                    return (
                      <li key={a.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                        <span className="tabular w-[76px] shrink-0 text-[15px] font-bold">
                          {a.scheduledAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: IST })}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {href ? (
                              <Link href={href} className="text-[15.5px] font-semibold hover:text-[var(--accent-text)]">{who}</Link>
                            ) : (
                              <span className="text-[15.5px] font-semibold">{who}</span>
                            )}
                            {a.status === "COMPLETED" && <Flag tone="good">completed</Flag>}
                            {a.status === "NO_SHOW" && <Flag tone="alert">no show</Flag>}
                            {a.status === "CANCELLED" && <span className="text-[12px] text-[var(--ink-3)]">cancelled</span>}
                            {isOverdue && <Flag tone="watch">needs marking off</Flag>}
                          </div>
                          <p className="mt-1 text-[13.5px] text-[var(--ink-2)]">
                            {a.type === "INITIAL" ? "Initial consultation" : "Follow-up"} ·{" "}
                            {a.mode === "VIDEO" ? "Online" : "In clinic"} · {a.durationMin} min
                            {phone ? ` · ${phone}` : ""}
                          </p>
                          {a.reason && <p className="mt-1 text-[13.5px] text-[var(--ink-3)]">Reason: {a.reason}</p>}
                          {a.notes && <p className="mt-1 text-[13.5px] italic text-[var(--ink-3)]">&ldquo;{a.notes}&rdquo;</p>}
                        </div>
                        {a.status === "SCHEDULED" ? (
                          <AppointmentActions id={a.id} />
                        ) : (
                          <span className="shrink-0 text-[12.5px] text-[var(--ink-3)]">{timeAgo(a.updatedAt)}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
