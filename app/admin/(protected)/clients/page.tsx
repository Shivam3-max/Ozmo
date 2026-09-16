import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { clinicDay, daysBetween } from "@/lib/clinic-time";
import { pageFrom, pageInfo, paging } from "@/lib/pagination";
import { PageTitle, Panel, Empty, Flag, th, td } from "@/components/admin/ui";
import Pager from "@/components/admin/Pager";
import { can } from "@/lib/policy";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;
const VIEWS = [
  { key: "current", label: "Current", where: { status: { in: ["ACTIVE", "AT_RISK", "PAUSED"] } } },
  { key: "at-risk", label: "At risk", where: { status: "AT_RISK" } },
  { key: "completed", label: "Completed", where: { status: "COMPLETED" } },
  { key: "archived", label: "Archived", where: { status: "ARCHIVED" } },
  { key: "all", label: "All", where: {} },
] as const;

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string; page?: string }>;
}) {
  const user = await requireStaff();
  const showHealth = can(user.role, "health.read");
  const { q = "", view: rawView = "current", page: rawPage } = await searchParams;
  const view = VIEWS.find((v) => v.key === rawView) ?? VIEWS[0];
  const page = pageFrom(rawPage);

  const needle = q.trim();
  const digits = needle.replace(/\D/g, "");
  const where: Prisma.ClientWhereInput = {
    clinicId: user.clinicId,
    deletedAt: null,
    ...(view.where as Prisma.ClientWhereInput),
    ...(needle
      ? {
          OR: [
            { user: { name: { contains: needle } } },
            { clientCode: { contains: needle } },
            ...(digits.length >= 4 ? [{ user: { phone: { contains: digits } } }] : []),
          ],
        }
      : {}),
  };

  const [total, clients] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      orderBy: { joinedAt: "desc" },
      ...paging(page, PAGE_SIZE),
      include: {
        user: { select: { name: true } },
        enrollments: { orderBy: { startDate: "desc" }, take: 1, include: { program: { select: { name: true } } } },
        measurements: showHealth ? { orderBy: { date: "desc" }, take: 1, select: { weightKg: true } } : false,
        dietPlans: { where: { status: "ACTIVE" }, take: 1, select: { id: true } },
      },
    }),
  ]);
  const info = pageInfo(page, PAGE_SIZE, total);
  const today = clinicDay();

  return (
    <>
      <PageTitle
        title="Clients"
        sub={needle ? `${total} match “${needle}”` : view.key === "all" ? `${total} on the books` : `${total} ${view.label.toLowerCase()}`}
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

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {VIEWS.map((v) => (
          <Link
            key={v.key}
            href={`/admin/clients?view=${v.key}${needle ? `&q=${encodeURIComponent(needle)}` : ""}`}
            className={`rounded-full px-3.5 py-2 text-[13px] font-semibold ${
              v.key === view.key ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)]"
            }`}
          >
            {v.label}
          </Link>
        ))}
      </div>

      <form action="/admin/clients" className="mb-4 flex flex-wrap gap-2">
        <input type="hidden" name="view" value={view.key} />
        <input
          name="q"
          defaultValue={needle}
          aria-label="Search clients"
          placeholder="Search name, code or phone…"
          className="min-h-[42px] w-[280px] rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 text-[14.5px]"
        />
        <button className="min-h-[42px] rounded-full border border-[var(--line)] bg-[var(--paper)] px-5 text-[14px] font-semibold hover:border-[var(--ink)]">
          Search
        </button>
        {needle && <Link href={`/admin/clients?view=${view.key}`} className="self-center text-[13.5px] text-[var(--ink-3)]">Clear</Link>}
      </form>

      <Panel>
        {clients.length === 0 ? (
          <Empty
            title={needle || view.key !== "current" ? "No clients here" : "No clients yet"}
            body={
              needle || view.key !== "current"
                ? "Try another search or view."
                : "Clients are created by converting a lead — open a lead, choose a programme and duration, and the account, enrollment and health record are created together."
            }
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
                  const dayNo = e ? Math.max(1, daysBetween(clinicDay(e.startDate), today) + 1) : null;
                  const totalDays = e ? daysBetween(clinicDay(e.startDate), clinicDay(e.endDate)) : null;
                  const weight = c.measurements?.[0]?.weightKg ?? c.startWeightKg;
                  return (
                    <tr key={c.id} className="hover:bg-[var(--tint)]">
                      <td className={td}>
                        <Link href={`/admin/clients/${c.id}`} className="font-semibold hover:text-[var(--accent-text)]">
                          {c.user.name}
                        </Link>
                        <span className="tabular mt-0.5 block text-[12.5px] text-[var(--ink-3)]">{c.clientCode}</span>
                      </td>
                      <td className={`${td} text-[var(--ink-2)]`}>{e?.program.name ?? "—"}</td>
                      <td className={`${td} tabular text-[var(--ink-2)]`}>{dayNo && totalDays ? `${dayNo} / ${totalDays}` : "—"}</td>
                      {showHealth && <td className={`${td} tabular`}>{weight ? `${weight} kg` : "—"}</td>}
                      <td className={td}>
                        {c.dietPlans.length > 0 ? <Flag tone="good">active</Flag> : <Flag tone="watch">none yet</Flag>}
                      </td>
                      <td className={`${td} text-[var(--ink-2)]`}>
                        {c.status === "AT_RISK" ? <Flag tone="alert">at risk</Flag> : c.status.toLowerCase()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <Pager info={info} base="/admin/clients" params={{ view: view.key, q: needle || undefined }} noun="clients" />
    </>
  );
}
