import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStaff, canSeeHealthData } from "@/lib/auth";
import { asObject, asStrings, asArray } from "@/lib/json";
import { getProgram } from "@/lib/programs";
import { questions } from "@/lib/assessment";
import { PageTitle, Panel, StageTag, Flag, td, th, timeAgo } from "@/components/admin/ui";
import StageControl from "@/components/admin/StageControl";
import ConvertLead from "@/components/admin/ConvertLead";

export const dynamic = "force-dynamic";

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  const showHealth = canSeeHealthData(user.role);
  const { id } = await params;

  const programs = await prisma.program.findMany({
    where: { clinicId: "ozmo", isActive: true },
    orderBy: { order: "asc" },
    select: { slug: true, name: true, durations: true },
  });

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assessment: true,
      activities: { orderBy: { createdAt: "desc" } },
      appointments: { orderBy: { scheduledAt: "asc" } },
    },
  });
  if (!lead) notFound();

  const a = lead.assessment;
  const responses = asObject<Record<string, unknown>>(a?.responses);
  const program = a?.recommendedProgram ? getProgram(a.recommendedProgram) : undefined;
  const conditions = asStrings(lead.conditions).filter((c) => c !== "None of these");

  // Render the assessment in the order it was asked, so it reads like the conversation.
  const answered = questions
    .map((q) => ({ q, value: responses[q.id] }))
    .filter(({ value }) => value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0));

  return (
    <>
      <Link href="/admin/leads" className="mb-4 inline-block text-[13.5px] text-[var(--ink-3)] hover:text-[var(--ink)]">
        ← Leads
      </Link>

      <PageTitle
        title={lead.name}
        sub={`${lead.phone}${lead.email ? ` · ${lead.email}` : ""}${lead.city ? ` · ${lead.city}` : ""}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StageTag stage={lead.stage} />
            {showHealth && lead.requiresMedicalCaution && <Flag tone="alert">medical caution</Flag>}
            <span className="tabular rounded-full bg-[var(--ink)] px-3 py-1 text-[12px] font-bold text-white">
              score {lead.score}
            </span>
          </div>
        }
      />

      {showHealth && lead.requiresMedicalCaution && (
        <Panel className="mb-6 border-[var(--alert)]/30 bg-[var(--alert)]/5 px-6 py-5">
          <p className="text-[15px] leading-relaxed text-[var(--ink-2)]">
            <strong className="font-semibold text-[var(--ink)]">Doctor first.</strong> This person
            flagged a heart condition, kidney condition or pregnancy. Their snapshot showed the
            &ldquo;speak to your doctor&rdquo; message instead of a programme recommendation. Get
            their doctor&rsquo;s guidance before building anything.
          </p>
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="grid gap-6">
          {a && showHealth ? (
            <Panel>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-3.5">
                <h2 className="text-[15px] font-semibold">Health assessment</h2>
                <div className="flex items-center gap-3 text-[13px] text-[var(--ink-3)]">
                  <span className="tabular">
                    BMI {a.bmi ?? "—"} · {a.weightKg ?? "—"} kg · {a.heightCm ?? "—"} cm
                  </span>
                  <Link
                    href={`/assessment/snapshot/${a.token}`}
                    target="_blank"
                    className="font-semibold text-[var(--accent-text)]"
                  >
                    Their snapshot →
                  </Link>
                </div>
              </div>
              <dl className="divide-y divide-[var(--line-soft)]">
                {answered.map(({ q, value }) => (
                  <div key={q.id} className="grid gap-1 px-5 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:gap-6">
                    <dt className="text-[13px] text-[var(--ink-3)]">{q.label}</dt>
                    <dd className="text-[14.5px]">
                      {Array.isArray(value)
                        ? value.join(", ")
                        : typeof value === "object" && value !== null
                        ? Object.entries(value as Record<string, string>)
                            .filter(([, v]) => v)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ") || "—"
                        : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </Panel>
          ) : (
            <Panel className="px-6 py-8">
              <p className="text-[15px] text-[var(--ink-2)]">
                {a
                  ? "Your role doesn't include access to health data."
                  : "This lead hasn't completed the health assessment."}
              </p>
            </Panel>
          )}

          {a && showHealth && (
            <Panel>
              <h2 className="border-b border-[var(--line)] px-5 py-3.5 text-[15px] font-semibold">
                What their snapshot said
              </h2>
              <div className="grid gap-4 px-5 py-5">
                {asArray<{ heading: string; body: string }>(a.snapshotCards).map((c) => (
                  <div key={c.heading}>
                    <p className="text-[14.5px] font-semibold">{c.heading}</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-[var(--ink-2)]">{c.body}</p>
                  </div>
                ))}
                {program && (
                  <p className="mt-1 rounded-lg bg-[var(--tint)] px-4 py-3 text-[14px]">
                    Recommended: <strong className="font-semibold">{program.name}</strong>
                  </p>
                )}
              </div>
            </Panel>
          )}
        </div>

        <div className="grid gap-6">
          <Panel className="px-5 py-5">
            <h2 className="mb-4 text-[15px] font-semibold">Move this lead</h2>
            <StageControl leadId={lead.id} stage={lead.stage} />
          </Panel>

          {lead.convertedClientId ? (
            <Panel className="border-[var(--good)]/30 bg-[var(--good)]/5 px-5 py-5">
              <p className="text-[14.5px] text-[var(--ink-2)]">
                Already a client.{" "}
                <Link href={`/admin/clients/${lead.convertedClientId}`} className="font-semibold text-[var(--good)]">
                  Open their file →
                </Link>
              </p>
            </Panel>
          ) : (
            <Panel className="px-5 py-5">
              <h2 className="mb-4 text-[15px] font-semibold">Convert to client</h2>
              <ConvertLead
                leadId={lead.id}
                programs={programs.map((p) => ({ ...p, durations: asArray<number>(p.durations) }))}
                suggested={a?.recommendedProgram ?? null}
              />
            </Panel>
          )}

          <Panel>
            <h2 className="border-b border-[var(--line)] px-5 py-3.5 text-[15px] font-semibold">Appointments</h2>
            {lead.appointments.length === 0 ? (
              <p className="px-5 py-5 text-[14px] text-[var(--ink-3)]">None booked.</p>
            ) : (
              <ul className="divide-y divide-[var(--line-soft)]">
                {lead.appointments.map((ap) => (
                  <li key={ap.id} className="px-5 py-3.5">
                    <p className="tabular text-[14px] font-semibold">
                      {ap.scheduledAt.toLocaleString("en-IN", {
                        weekday: "short", day: "numeric", month: "short",
                        hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
                      })}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[var(--ink-2)]">
                      {ap.type === "INITIAL" ? "Initial" : "Follow-up"} ·{" "}
                      {ap.mode === "VIDEO" ? "Online" : "In clinic"} · {ap.status.toLowerCase()}
                    </p>
                    {ap.reason && <p className="mt-1 text-[13px] text-[var(--ink-3)]">{ap.reason}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <h2 className="border-b border-[var(--line)] px-5 py-3.5 text-[15px] font-semibold">Activity</h2>
            <ul className="divide-y divide-[var(--line-soft)]">
              {lead.activities.map((act) => (
                <li key={act.id} className="px-5 py-3">
                  <p className="text-[13.5px] font-semibold">{act.type.replace(/_/g, " ").toLowerCase()}</p>
                  {act.note && <p className="mt-0.5 text-[13px] text-[var(--ink-2)]">{act.note}</p>}
                  <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">{timeAgo(act.createdAt)}</p>
                </li>
              ))}
            </ul>
          </Panel>

          {conditions.length > 0 && showHealth && (
            <Panel className="px-5 py-5">
              <h2 className="mb-3 text-[15px] font-semibold">Conditions declared</h2>
              <div className="flex flex-wrap gap-2">
                {conditions.map((c) => (
                  <span key={c} className="rounded-full bg-[var(--tint)] px-3 py-1.5 text-[13px]">{c}</span>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
