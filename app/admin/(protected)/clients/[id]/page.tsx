import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStaff, canSeeHealthData, canEditPlans } from "@/lib/auth";
import { CLINIC_ID } from "@/lib/leads";
import { asStrings } from "@/lib/json";
import { PageTitle, Panel, Flag, Empty, timeAgo, th, td } from "@/components/admin/ui";
import NewPlanButton from "@/components/admin/NewPlanButton";
import AddMeasurement from "@/components/admin/AddMeasurement";
import PortalInvite from "@/components/admin/PortalInvite";

export const dynamic = "force-dynamic";

export default async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  const showHealth = canSeeHealthData(user.role);
  const { id } = await params;

  const client = await prisma.client.findFirst({
    where: { id, clinicId: CLINIC_ID },
    include: {
      user: true,
      assessment: true,
      healthProfiles: { orderBy: { version: "desc" }, take: 1 },
      enrollments: { orderBy: { startDate: "desc" }, include: { program: true } },
      dietPlans: { orderBy: { version: "desc" }, include: { createdBy: true } },
      measurements: { orderBy: { date: "desc" }, take: 10 },
      appointments: { orderBy: { scheduledAt: "desc" }, take: 5 },
    },
  });
  if (!client) notFound();

  const templates = await prisma.planTemplate.findMany({
    where: { clinicId: CLINIC_ID },
    select: { id: true, name: true, description: true },
    orderBy: { name: "asc" },
  });

  const e = client.enrollments[0];
  const a = client.assessment;
  const latest = client.measurements[0];
  const conditions = asStrings(client.healthProfiles[0]?.conditions ?? a?.conditions).filter((c) => c !== "None of these");
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
        sub={`${client.clientCode} · ${client.user.phone ?? ""}${e ? ` · ${e.program.name}` : ""}${dayNo && totalDays ? ` · day ${dayNo} of ${totalDays}` : ""}`}
        action={canEditPlans(user.role) ? <NewPlanButton clientId={client.id} templates={templates} /> : null}
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
          <Panel>
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
          </Panel>

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
                        <td className={`${td} tabular`}>{m.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
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
            <h2 className="mb-3 text-[15px] font-semibold">Client portal</h2>
            <PortalInvite clientId={client.id} email={client.user.email} />
          </Panel>

          <Panel className="px-5 py-5">
            <h2 className="mb-3 text-[15px] font-semibold">Programme</h2>
            {e ? (
              <dl className="grid gap-2.5 text-[14px]">
                <div className="flex justify-between gap-4"><dt className="text-[var(--ink-3)]">Plan</dt><dd className="font-semibold">{e.program.name}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[var(--ink-3)]">Started</dt><dd className="tabular">{e.startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[var(--ink-3)]">Ends</dt><dd className="tabular">{e.endDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[var(--ink-3)]">Follow-ups</dt><dd className="tabular">{e.followUpsUsed} of {e.followUpsIncluded} used</dd></div>
              </dl>
            ) : (
              <p className="text-[14px] text-[var(--ink-3)]">No enrollment recorded.</p>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
