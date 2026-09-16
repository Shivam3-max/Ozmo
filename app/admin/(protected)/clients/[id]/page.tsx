import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { asStrings } from "@/lib/json";
import { PageTitle, Panel, Flag, Empty, timeAgo, th, td } from "@/components/admin/ui";
import NewPlanButton from "@/components/admin/NewPlanButton";
import AddMeasurement from "@/components/admin/AddMeasurement";
import PortalInvite from "@/components/admin/PortalInvite";
import { formatPhone } from "@/lib/phone";
import { CLINIC_TIME_ZONE } from "@/lib/clinic-time";
import ScheduleAppointment, { MeetingLink } from "@/components/admin/ScheduleAppointment";
import { formatClinic } from "@/lib/clinic-time";
import { can } from "@/lib/policy";
import { periodLabel } from "@/lib/services/reports";
import { documentsConfigured } from "@/lib/documents/crypto";
import { DOCUMENT_LABEL, DOCUMENT_TYPES, type DocumentTypeValue } from "@/lib/documents/files";
import { NewReportButton } from "@/components/admin/ReportEditor";
import DocumentActions from "@/components/admin/DocumentActions";
import UploadDocument from "@/components/UploadDocument";

export const dynamic = "force-dynamic";

export default async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  const showHealth = can(user.role, "health.read");
  const { id } = await params;

  const client = await prisma.client.findFirst({
    where: { id, clinicId: user.clinicId },
    include: {
      user: true,
      assessment: showHealth,
      healthProfiles: showHealth ? { orderBy: { version: "desc" as const }, take: 1 } : false,
      enrollments: { orderBy: { startDate: "desc" }, include: { program: true } },
      dietPlans: showHealth ? { orderBy: { version: "desc" as const }, include: { createdBy: true } } : false,
      measurements: showHealth ? { orderBy: { date: "desc" as const }, take: 10 } : false,
      progressReports: showHealth ? { orderBy: { periodEnd: "desc" as const }, take: 12, select: { id: true, periodStart: true, periodEnd: true, status: true } } : false,
      documents: showHealth
        ? { orderBy: { createdAt: "desc" as const }, take: 50, select: { id: true, title: true, type: true, sizeBytes: true, createdAt: true, uploadedById: true, visibleToClient: true } }
        : false,
      appointments: { where: { OR: [{ status: "SCHEDULED" }, { scheduledAt: { gte: new Date(Date.now() - 90 * 864e5) } }] }, orderBy: { scheduledAt: "desc" }, take: 8 },
    },
  });
  if (!client) notFound();
  if (client.deletedAt) {
    return (
      <>
        <Link href="/admin/clients" className="mb-4 inline-block text-[13.5px] text-[var(--ink-3)] hover:text-[var(--ink)]">← Clients</Link>
        <PageTitle title="Erased client" sub={client.clientCode} />
        <Panel className="px-6 py-6">
          <p className="max-w-[65ch] text-[15px] leading-relaxed text-[var(--ink-2)]">
            This client&rsquo;s personal and health information was erased on{" "}
            {formatClinic(client.deletedAt, { day: "numeric", month: "long", year: "numeric" })}. Only the programme record and
            appointment dates remain, without personal details.
          </p>
        </Panel>
      </>
    );
  }
  if (showHealth) {
    await prisma.auditLog.create({ data: { clinicId: user.clinicId, actorId: user.sub, action: "CLIENT_RECORD_VIEWED", entityType: "Client", entityId: id } });
  }

  const templates = await prisma.planTemplate.findMany({
    where: { clinicId: user.clinicId },
    select: { id: true, name: true, description: true },
    orderBy: { name: "asc" },
  });

  const e = client.enrollments[0];
  const a = client.assessment;
  // Relations excluded for roles without health access come back undefined, not [].
  const latest = client.measurements?.[0];
  const conditions = asStrings(client.healthProfiles?.[0]?.conditions ?? a?.conditions).filter((c) => c !== "None of these");
  const allergies = asStrings(client.allergies);
  const dayNo = e ? Math.max(1, Math.ceil((Date.now() - e.startDate.getTime()) / 864e5)) : null;
  const totalDays = e ? Math.ceil((e.endDate.getTime() - e.startDate.getTime()) / 864e5) : null;

  const change =
    latest?.weightKg && client.startWeightKg ? Math.round((latest.weightKg - client.startWeightKg) * 10) / 10 : null;

  return (
    <>
      <Link href="/admin/clients" className="mb-4 inline-block text-[13.5px] text-[var(--ink-3)] hover:text-[var(--ink)]">
        ← Clients
      </Link>

      <PageTitle
        title={client.user.name}
        sub={`${client.clientCode} · ${formatPhone(client.user.phone)}${e ? ` · ${e.program.name}` : ""}${dayNo && totalDays ? ` · day ${dayNo} of ${totalDays}` : ""}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/admin/clients/${client.id}/edit`} className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-[13.5px] font-semibold hover:border-[var(--ink)]">
              Edit details
            </Link>
            {can(user.role, "plans.edit") ? <NewPlanButton clientId={client.id} templates={templates} /> : null}
          </div>
        }
      />

      {showHealth && allergies.length > 0 && (
        <Panel className="mb-6 border-[var(--alert)]/30 bg-[var(--alert)]/5 px-6 py-4">
          <p className="text-[14.5px]">
            <strong className="font-semibold text-[var(--alert)]">Allergies:</strong>{" "}
            <span className="text-[var(--ink-2)]">{allergies.join(", ")}</span> — the plan builder blocks these.
          </p>
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="grid gap-6">
          {showHealth && <Panel>
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3.5">
              <h2 className="text-[15px] font-semibold">Diet plans</h2>
              <Link href="/admin/plans" className="text-[13.5px] font-semibold text-[var(--accent-text)]">All plans →</Link>
            </div>
            {client.dietPlans.length === 0 ? (
              <Empty title="No plan yet" body="Start one from a template or blank — the button is at the top of this page." />
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={th}>Plan</th>
                    <th className={th}>Version</th>
                    <th className={th}>Status</th>
                    <th className={th}>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {client.dietPlans.map((p) => (
                    <tr key={p.id} className="hover:bg-[var(--tint)]">
                      <td className={td}>
                        <Link href={`/admin/plans/${p.id}`} className="font-semibold hover:text-[var(--accent-text)]">{p.title}</Link>
                      </td>
                      <td className={`${td} tabular`}>v{p.version}</td>
                      <td className={td}>
                        {p.status === "ACTIVE" ? <Flag tone="good">active</Flag> : p.status === "DRAFT" ? <Flag tone="watch">draft</Flag> : <span className="text-[13px] text-[var(--ink-3)]">archived</span>}
                      </td>
                      <td className={`${td} text-[var(--ink-3)]`}>{timeAgo(p.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>}

          {showHealth && (
            <Panel>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-3">
                <h2 className="text-[15px] font-semibold">Measurements</h2>
                <AddMeasurement clientId={client.id} />
              </div>
              {client.measurements.length === 0 ? (
                <Empty title="Nothing recorded" body="Weights logged by the client, or entered here after a consultation, appear in this list." />
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className={th}>Date</th>
                      <th className={th}>Weight</th>
                      <th className={th}>Waist</th>
                      <th className={th}>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.measurements.map((m) => (
                      <tr key={m.id}>
                        <td className={`${td} tabular`}>{m.date.toLocaleDateString("en-IN", { timeZone: CLINIC_TIME_ZONE, day: "numeric", month: "short", year: "numeric" })}</td>
                        <td className={`${td} tabular font-semibold`}>{m.weightKg ?? "—"}</td>
                        <td className={`${td} tabular`}>{m.waistCm ?? "—"}</td>
                        <td className={`${td} text-[var(--ink-3)]`}>{m.note ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          )}

          {showHealth && (
            <Panel>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-3">
                <h2 className="text-[15px] font-semibold">Progress reports</h2>
                {can(user.role, "reports.write") && <NewReportButton clientId={client.id} />}
              </div>
              {client.progressReports.length === 0 ? (
                <Empty title="No reports yet" body="Draft one from the last 30 days of measurements and logs, add your observations, then approve and share it." />
              ) : (
                <ul>
                  {client.progressReports.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line-soft)] px-5 py-3 last:border-0">
                      <Link href={`/admin/clients/${client.id}/reports/${r.id}`} className="tabular text-[14px] font-semibold hover:text-[var(--accent-text)]">
                        {periodLabel(r.periodStart, r.periodEnd)}
                      </Link>
                      {r.status === "SENT" ? <Flag tone="good">shared</Flag> : r.status === "APPROVED" ? <Flag tone="good">approved</Flag> : <Flag tone="watch">draft</Flag>}
                    </li>
                  ))}
                </ul>
              )}
              {e && (
                <p className="border-t border-[var(--line)] px-5 py-2.5 text-[12.5px] text-[var(--ink-3)]">
                  {e.reportsDelivered} of {e.reportsIncluded} reports in the programme shared.
                </p>
              )}
            </Panel>
          )}

          {showHealth && (
            <Panel>
              <div className="border-b border-[var(--line)] px-5 py-3.5">
                <h2 className="text-[15px] font-semibold">Documents</h2>
              </div>
              {client.documents.length === 0 ? (
                <Empty title="No documents" body="Lab reports and scans uploaded here or shared by the client from their portal appear in this list." />
              ) : (
                <ul>
                  {client.documents.map((d) => (
                    <li key={d.id} className="grid gap-1 border-b border-[var(--line-soft)] px-5 py-3 last:border-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <a href={`/api/documents/${d.id}`} target="_blank" rel="noopener" className="text-[14px] font-semibold hover:text-[var(--accent-text)]">
                          {d.title}
                        </a>
                        <span className="tabular text-[12.5px] text-[var(--ink-3)]">
                          {DOCUMENT_LABEL[d.type as DocumentTypeValue]} · {d.sizeBytes ? `${Math.max(1, Math.round(d.sizeBytes / 1024))} KB` : "—"} · {formatClinic(d.createdAt, { day: "numeric", month: "short" })}
                          {d.uploadedById === client.userId ? " · from client" : ""}
                          {!d.visibleToClient ? " · staff only" : ""}
                        </span>
                      </div>
                      {can(user.role, "documents.upload") && <DocumentActions id={d.id} title={d.title} visibleToClient={d.visibleToClient} />}
                    </li>
                  ))}
                </ul>
              )}
              {can(user.role, "documents.upload") && (
                <div className="border-t border-[var(--line)] px-5 py-4">
                  {documentsConfigured() ? (
                    <UploadDocument endpoint={`/api/admin/clients/${client.id}/documents`} types={DOCUMENT_TYPES} askVisibility />
                  ) : (
                    <p className="text-[13.5px] text-[var(--ink-2)]">Uploads are off until <code>DOCUMENT_ENCRYPTION_KEY</code> is set on the server.</p>
                  )}
                </div>
              )}
            </Panel>
          )}
        </div>

        <div className="grid gap-6">
          {showHealth && (
            <Panel className="px-5 py-5">
              <h2 className="mb-4 text-[15px] font-semibold">At a glance</h2>
              <dl className="grid gap-3 text-[14px]">
                <div className="flex justify-between gap-4"><dt className="text-[var(--ink-3)]">Start weight</dt><dd className="tabular font-semibold">{client.startWeightKg ?? "—"} kg</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[var(--ink-3)]">Latest</dt><dd className="tabular font-semibold">{latest?.weightKg ?? "—"} kg</dd></div>
                {change !== null && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--ink-3)]">Change</dt>
                    <dd className={`tabular font-semibold ${change < 0 ? "text-[var(--good)]" : change > 0 ? "text-[var(--watch)]" : ""}`}>
                      {change > 0 ? "+" : ""}{change} kg
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4"><dt className="text-[var(--ink-3)]">Height</dt><dd className="tabular">{client.heightCm ?? "—"} cm</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[var(--ink-3)]">Preference</dt><dd>{client.foodPreference ?? "—"}</dd></div>
              </dl>
              {conditions.length > 0 && (
                <>
                  <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">Conditions</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {conditions.map((c) => <span key={c} className="rounded-full bg-[var(--tint)] px-2.5 py-1 text-[12.5px]">{c}</span>)}
                  </div>
                </>
              )}
              {a && (
                <Link href={`/assessment/snapshot/${a.token}`} target="_blank" className="mt-5 block text-[13.5px] font-semibold text-[var(--accent-text)]">
                  Their health snapshot →
                </Link>
              )}
            </Panel>
          )}

          <Panel className="px-5 py-5">
            <h2 className="mb-3 text-[15px] font-semibold">Appointments</h2>
            {client.appointments.length === 0 ? (
              <p className="mb-4 text-[14px] text-[var(--ink-3)]">Nothing scheduled.</p>
            ) : (
              <ul className="mb-4 grid gap-3">
                {client.appointments.map((ap) => (
                  <li key={ap.id} className="border-b border-[var(--line-soft)] pb-3 last:border-0 last:pb-0">
                    <p className="tabular text-[14px] font-semibold">
                      {formatClinic(ap.scheduledAt, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-[13px] text-[var(--ink-2)]">
                      {ap.type === "INITIAL" ? "Initial" : "Follow-up"} · {ap.mode === "VIDEO" ? "video" : "in clinic"} · {ap.durationMin} min · {ap.status.toLowerCase().replace("_", " ")}
                    </p>
                    {ap.status === "SCHEDULED" && ap.mode === "VIDEO" && ap.scheduledAt > new Date() && (
                      <MeetingLink appointmentId={ap.id} initial={ap.meetingUrl} />
                    )}
                  </li>
                ))}
              </ul>
            )}
            <ScheduleAppointment
              clientId={client.id}
              defaultType="FOLLOW_UP"
              followUps={e ? { used: e.followUpsUsed, included: e.followUpsIncluded } : null}
            />
          </Panel>

          <Panel className="px-5 py-5">
            <h2 className="mb-3 text-[15px] font-semibold">Client portal</h2>
            <PortalInvite
              clientId={client.id}
              email={client.user.email}
              hasPassword={Boolean(client.user.passwordHash)}
              canInvite={can(user.role, "portal.invite")}
              canReset={can(user.role, "portal.reset")}
            />
          </Panel>

          <Panel className="px-5 py-5">
            <h2 className="mb-3 text-[15px] font-semibold">Programme</h2>
            {e ? (
              <dl className="grid gap-2.5 text-[14px]">
                <div className="flex justify-between gap-4"><dt className="text-[var(--ink-3)]">Plan</dt><dd className="font-semibold">{e.program.name}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[var(--ink-3)]">Started</dt><dd className="tabular">{e.startDate.toLocaleDateString("en-IN", { timeZone: CLINIC_TIME_ZONE, day: "numeric", month: "short" })}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[var(--ink-3)]">Ends</dt><dd className="tabular">{e.endDate.toLocaleDateString("en-IN", { timeZone: CLINIC_TIME_ZONE, day: "numeric", month: "short" })}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[var(--ink-3)]">Follow-ups</dt><dd className="tabular">{e.followUpsUsed} of {e.followUpsIncluded} used</dd></div>
              </dl>
            ) : (
              <p className="text-[14px] text-[var(--ink-3)]">No enrollment recorded.</p>
            )}
          </Panel>

          {can(user.role, "privacy.manage") && (
            <Link href={`/admin/clients/${client.id}/erase`} className="w-fit text-[13px] text-[var(--ink-3)] underline hover:text-[var(--alert)]">
              Erase this client&rsquo;s data…
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
