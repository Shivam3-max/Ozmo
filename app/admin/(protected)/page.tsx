import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireStaff, canSeeHealthData } from "@/lib/auth";
import { CLINIC_ID } from "@/lib/leads";
import { PageTitle, Panel, Stat, StageTag, Flag, Empty, th, td, timeAgo } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const user = await requireStaff();
  const showHealth = canSeeHealthData(user.role);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const weekAhead = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [newLeads, needsCall, todaysAppts, weekAppts, unhandled, cautionLeads, recent] = await Promise.all([
    prisma.lead.count({ where: { clinicId: CLINIC_ID, stage: "NEW" } }),
    prisma.lead.count({ where: { clinicId: CLINIC_ID, stage: "NEW", score: { gte: 70 } } }),
    prisma.appointment.count({
      where: { status: "SCHEDULED", scheduledAt: { gte: startOfToday, lt: new Date(startOfToday.getTime() + 864e5) } },
    }),
    prisma.appointment.findMany({
      where: { status: "SCHEDULED", scheduledAt: { gte: startOfToday, lte: weekAhead } },
      orderBy: { scheduledAt: "asc" },
      take: 6,
      include: { lead: true, client: { include: { user: true } } },
    }),
    prisma.contactMessage.count({ where: { clinicId: CLINIC_ID, handledAt: null } }),
    prisma.lead.count({ where: { clinicId: CLINIC_ID, requiresMedicalCaution: true, stage: { in: ["NEW", "CONTACTED"] } } }),
    prisma.lead.findMany({
      where: { clinicId: CLINIC_ID },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { assessment: { select: { id: true } } },
    }),
  ]);

  const fresh = recent.filter((l) => l.createdAt >= dayAgo).length;

  return (
    <>
      <PageTitle
        title={`Good day, ${user.name.split(" ")[0]}`}
        sub={`${fresh} new in the last 24 hours · ${newLeads} leads waiting`}
      />

      <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)] lg:grid-cols-4">
        <Stat label="New leads" value={newLeads} sub="not yet contacted" href="/admin/leads?stage=NEW" tone={newLeads > 0 ? "watch" : "plain"} />
        <Stat label="Call today" value={needsCall} sub="score 70+" href="/admin/leads" tone={needsCall > 0 ? "alert" : "plain"} />
        <Stat label="Consultations today" value={todaysAppts} sub="scheduled" href="/admin/appointments" />
        <Stat label="Unread enquiries" value={unhandled} sub="from the contact form" href="/admin/enquiries" tone={unhandled > 0 ? "watch" : "plain"} />
      </div>

      {showHealth && cautionLeads > 0 && (
        <Panel className="mb-8 border-[var(--alert)]/30 bg-[var(--alert)]/5 px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <Flag tone="alert">Medical caution</Flag>
            <p className="text-[15px] text-[var(--ink-2)]">
              <strong className="font-semibold text-[var(--ink)]">{cautionLeads}</strong>{" "}
              {cautionLeads === 1 ? "lead has" : "leads have"} flagged a heart condition, kidney
              condition or pregnancy. Their snapshot already told them to speak to a doctor first —
              involve one before starting any programme.
            </p>
            <Link href="/admin/leads" className="ml-auto text-[14px] font-semibold text-[var(--accent-text)]">
              Review →
            </Link>
          </div>
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Panel>
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3.5">
            <h2 className="text-[15px] font-semibold">Latest leads</h2>
            <Link href="/admin/leads" className="text-[13.5px] font-semibold text-[var(--accent-text)]">
              All leads →
            </Link>
          </div>
          {recent.length === 0 ? (
            <Empty
              title="No leads yet"
              body="Assessments, bookings and contact-form enquiries all land here the moment someone submits one."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse">
                <thead>
                  <tr>
                    <th className={th}>Name</th>
                    <th className={th}>Source</th>
                    <th className={th}>Score</th>
                    <th className={th}>Stage</th>
                    <th className={th}>When</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((l) => (
                    <tr key={l.id} className="hover:bg-[var(--tint)]">
                      <td className={td}>
                        <Link href={`/admin/leads/${l.id}`} className="font-semibold hover:text-[var(--accent-text)]">
                          {l.name}
                        </Link>
                        <span className="mt-0.5 block text-[12.5px] text-[var(--ink-3)]">{l.phone}</span>
                        {l.requiresMedicalCaution && showHealth && (
                          <span className="mt-1.5 inline-block">
                            <Flag tone="alert">caution</Flag>
                          </span>
                        )}
                      </td>
                      <td className={`${td} text-[var(--ink-2)]`}>{l.source.replace(/_/g, " ").toLowerCase()}</td>
                      <td className={`${td} tabular font-semibold`}>{l.score}</td>
                      <td className={td}>
                        <StageTag stage={l.stage} />
                      </td>
                      <td className={`${td} whitespace-nowrap text-[var(--ink-3)]`}>{timeAgo(l.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel>
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3.5">
            <h2 className="text-[15px] font-semibold">Next 7 days</h2>
            <Link href="/admin/appointments" className="text-[13.5px] font-semibold text-[var(--accent-text)]">
              Calendar →
            </Link>
          </div>
          {weekAppts.length === 0 ? (
            <Empty title="Nothing booked" body="Consultations booked from the website appear here." />
          ) : (
            <ul className="divide-y divide-[var(--line-soft)]">
              {weekAppts.map((a) => (
                <li key={a.id} className="px-5 py-3.5">
                  <p className="tabular text-[13px] font-semibold text-[var(--ink-3)]">
                    {a.scheduledAt.toLocaleString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Kolkata",
                    })}
                  </p>
                  <p className="mt-1 text-[14.5px] font-semibold">
                    {a.client?.user.name ?? a.lead?.name ?? "Unnamed"}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[var(--ink-2)]">
                    {a.type === "INITIAL" ? "Initial consultation" : "Follow-up"} ·{" "}
                    {a.mode === "VIDEO" ? "Online" : "In clinic"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
