import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentClient } from "@/lib/portal";
import { CLINIC_TIME_ZONE } from "@/lib/clinic-time";

export const dynamic = "force-dynamic";

export default async function PortalAppointments() {
  const client = await currentClient();
  if (!client) return null;

  const appointments = await prisma.appointment.findMany({
    where: { clientId: client.id },
    orderBy: { scheduledAt: "desc" },
    include: { note: true, dietitian: true },
    take: 50,
  });

  const now = new Date();
  const upcoming = appointments.filter((a) => a.scheduledAt >= now && a.status === "SCHEDULED").reverse();
  const past = appointments.filter((a) => a.scheduledAt < now || a.status !== "SCHEDULED");
  const enrollment = client.enrollments[0];

  return (
    <>
      <h1 className="font-[var(--font-display)] text-[clamp(24px,4vw,30px)] font-bold tracking-[-0.02em]">Consultations</h1>
      {enrollment && (
        <p className="mt-1.5 text-[14.5px] text-[var(--ink-3)]">
          {enrollment.followUpsUsed} of {enrollment.followUpsIncluded} follow-ups used
        </p>
      )}

      <section className="mt-6">
        <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-6 py-7">
            <p className="text-[15px] leading-relaxed text-[var(--ink-2)]">
              Nothing booked. <Link href="/portal/messages" className="font-semibold underline">Message your dietitian</Link> to arrange your next review.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {upcoming.map((a) => (
              <div key={a.id} className="rounded-2xl border-2 border-[var(--accent)] bg-[var(--accent)]/6 px-5 py-5">
                <p className="tabular font-[var(--font-display)] text-[20px] font-bold">
                  {a.scheduledAt.toLocaleString("en-IN", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}
                </p>
                <p className="mt-1.5 text-[14.5px] text-[var(--ink-2)]">
                  {a.type === "INITIAL" ? "Initial consultation" : "Follow-up"} ·{" "}
                  {a.mode === "VIDEO" ? "Online video call" : "At the clinic"}
                  {a.dietitian ? ` · with ${a.dietitian.name}` : ""}
                </p>
                {a.mode === "VIDEO" && (
                  a.meetingUrl ? (
                    <a
                      href={a.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-[var(--ink)] px-5 text-[15px] font-semibold text-white"
                    >
                      Join the video call →
                    </a>
                  ) : (
                    <p className="mt-3 text-[13.5px] text-[var(--ink-2)]">Your dietitian will add the video link here before the call.</p>
                  )
                )}
                <div className="mt-4 rounded-xl bg-[var(--paper)] px-4 py-3">
                  <p className="text-[13.5px] leading-relaxed text-[var(--ink-2)]">
                    <strong className="text-[var(--ink)]">Before you come:</strong> record this
                    week&rsquo;s weight, log the last few days, and jot down anything you want to ask.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">Past</h2>
          <div className="grid gap-3">
            {past.map((a) => (
              <div key={a.id} className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-5 py-4">
                <p className="tabular text-[14.5px] font-semibold">
                  {a.scheduledAt.toLocaleDateString("en-IN", { timeZone: CLINIC_TIME_ZONE, day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className="mt-0.5 text-[13.5px] text-[var(--ink-2)]">
                  {a.type === "INITIAL" ? "Initial consultation" : "Follow-up"} · {a.status.toLowerCase().replace("_", " ")}
                </p>
                {a.note?.sharedWithClient && (a.note.observations || a.note.planOfAction) && (
                  <div className="mt-3 rounded-xl bg-[var(--tint)] px-4 py-3">
                    <p className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Notes from this session</p>
                    {a.note.observations && <p className="mt-1.5 text-[14px] leading-relaxed">{a.note.observations}</p>}
                    {a.note.planOfAction && <p className="mt-1.5 text-[14px] leading-relaxed"><strong>Plan:</strong> {a.note.planOfAction}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
