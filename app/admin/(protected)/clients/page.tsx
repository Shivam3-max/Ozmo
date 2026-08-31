import Link from "next/link";
import { requireStaff, canSeeHealthData } from "@/lib/auth";
import { clinicClients } from "@/lib/clients";
import { PageTitle, Panel, Empty, Flag, th, td } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireStaff();
  const showHealth = canSeeHealthData(user.role);
  const { q = "" } = await searchParams;
  const all = await clinicClients();
  const needle = q.trim().toLowerCase();
  const clients = needle
    ? all.filter(
        (c) =>
          c.user.name.toLowerCase().includes(needle) ||
          c.clientCode.toLowerCase().includes(needle) ||
          (c.user.phone ?? "").includes(needle)
      )
    : all;

  return (
    <>
      <PageTitle
        title="Clients"
        sub={q ? `${clients.length} of ${all.length} match “${q}”` : `${all.length} on the books`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/leads" className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-[13.5px] font-semibold hover:border-[var(--ink)]">
              Convert a lead
            </Link>
            <Link href="/admin/clients/new" className="rounded-full bg-[var(--ink)] px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#163B4D]">
              + Add client
            </Link>
          </div>
        }
      />

      <form action="/admin/clients" className="mb-4 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, code or phone…"
          className="min-h-[42px] w-[280px] rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 text-[14.5px]"
        />
        <button className="min-h-[42px] rounded-full border border-[var(--line)] bg-[var(--paper)] px-5 text-[14px] font-semibold hover:border-[var(--ink)]">
          Search
        </button>
        {q && <Link href="/admin/clients" className="self-center text-[13.5px] text-[var(--ink-3)]">Clear</Link>}
      </form>

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
