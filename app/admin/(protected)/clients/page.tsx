import Link from "next/link";
import { requireStaff, canSeeHealthData } from "@/lib/auth";
import { clinicClients } from "@/lib/clients";
import { PageTitle, Panel, Empty, Flag, th, td } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const user = await requireStaff();
  const showHealth = canSeeHealthData(user.role);
  const clients = await clinicClients();

  return (
    <>
      <PageTitle
        title="Clients"
        sub={`${clients.length} on the books`}
        action={
          <Link href="/admin/leads" className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-[13.5px] font-semibold hover:border-[var(--ink)]">
            Convert a lead →
          </Link>
        }
      />

      <Panel>
        {clients.length === 0 ? (
          <Empty
            title="No clients yet"
            body="Clients are created by converting a lead — open a lead, choose a programme and duration, and the account, enrollment and health record are created together."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr>
                  <th className={th}>Client</th>
                  <th className={th}>Programme</th>
                  <th className={th}>Day</th>
                  {showHealth && <th className={th}>Weight</th>}
                  <th className={th}>Plan</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => {
                  const e = c.enrollments[0];
                  const dayNo = e ? Math.max(1, Math.ceil((Date.now() - e.startDate.getTime()) / 864e5)) : null;
                  const totalDays = e ? Math.ceil((e.endDate.getTime() - e.startDate.getTime()) / 864e5) : null;
                  return (
                    <tr key={c.id} className="hover:bg-[var(--tint)]">
                      <td className={td}>
                        <Link href={`/admin/clients/${c.id}`} className="font-semibold hover:text-[var(--accent-text)]">
                          {c.user.name}
                        </Link>
                        <span className="tabular mt-0.5 block text-[12.5px] text-[var(--ink-3)]">{c.clientCode}</span>
                      </td>
                      <td className={`${td} text-[var(--ink-2)]`}>{e?.program.name ?? "—"}</td>
                      <td className={`${td} tabular text-[var(--ink-2)]`}>
                        {dayNo && totalDays ? `${dayNo} / ${totalDays}` : "—"}
                      </td>
                      {showHealth && (
                        <td className={`${td} tabular`}>
                          {c.measurements[0]?.weightKg ?? c.startWeightKg ?? "—"}
                          {c.measurements[0]?.weightKg || c.startWeightKg ? " kg" : ""}
                        </td>
                      )}
                      <td className={td}>
                        {c.dietPlans.length > 0 ? <Flag tone="good">active</Flag> : <Flag tone="watch">none yet</Flag>}
                      </td>
                      <td className={`${td} text-[var(--ink-2)]`}>{c.status.toLowerCase()}</td>
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
