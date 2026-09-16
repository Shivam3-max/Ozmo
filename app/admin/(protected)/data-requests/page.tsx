import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import DataRequestActions from "@/components/admin/DataRequestActions";
import { Empty, PageTitle, Panel, timeAgo } from "@/components/admin/ui";
import { pageFrom, pageInfo, paging } from "@/lib/pagination";
import Pager from "@/components/admin/Pager";
import { can } from "@/lib/policy";

export const dynamic = "force-dynamic";

const statusStyle: Record<string, string> = {
  OPEN: "bg-[var(--alert)]/10 text-[var(--alert)]",
  IN_PROGRESS: "bg-[var(--watch)]/12 text-[var(--watch)]",
  COMPLETED: "bg-[var(--good)]/12 text-[var(--good)]",
  REJECTED: "bg-[var(--tint)] text-[var(--ink-3)]",
};

const PAGE_SIZE = 50;

export default async function DataRequestsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireStaff();
  if (!can(user.role, "privacy.manage")) {
    return (
      <Panel className="px-6 py-8">
        <p className="text-[15px] text-[var(--ink-2)]">Only the clinic administrator can manage privacy requests.</p>
      </Panel>
    );
  }

  const page = pageFrom((await searchParams).page);
  const scope = { client: { clinicId: user.clinicId } };
  const [total, open, requests] = await Promise.all([
    prisma.dataRequest.count({ where: scope }),
    prisma.dataRequest.count({ where: { ...scope, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.dataRequest.findMany({
      where: scope,
      include: { client: { include: { user: true } } },
      orderBy: { requestedAt: "desc" },
      ...paging(page, PAGE_SIZE),
    }),
  ]);
  await prisma.auditLog.create({
    data: {
      clinicId: user.clinicId,
      actorId: user.sub,
      action: "DATA_REQUEST_LIST_VIEWED",
      entityType: "DataRequest",
      entityId: "list",
    },
  });


  return (
    <>
      <PageTitle title="Data requests" sub={`${open} active · ${total} total`} />
      {requests.length === 0 ? (
        <Panel><Empty title="No data requests" body="Client deletion and correction requests will appear here." /></Panel>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Panel key={request.id} className="px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link href={`/admin/clients/${request.clientId}`} className="font-[var(--font-display)] text-[18px] font-bold hover:underline">
                      {request.client.user.name}
                    </Link>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] ${statusStyle[request.status]}`}>
                      {request.status.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-[13.5px] text-[var(--ink-2)]">
                    {request.type.toLowerCase()} request · {request.client.clientCode} · {request.client.user.email}
                  </p>
                  {request.resolution && <p className="mt-3 max-w-3xl text-[14px] text-[var(--ink-2)]">{request.resolution}</p>}
                  {request.type === "DELETE" && !request.client.deletedAt && (request.status === "OPEN" || request.status === "IN_PROGRESS") && (
                    <Link
                      href={`/admin/clients/${request.clientId}/erase?request=${request.id}`}
                      className="mt-3 inline-block rounded-full border border-[var(--alert)]/40 px-3 py-1.5 text-[12.5px] font-semibold text-[var(--alert)]"
                    >
                      Review and erase…
                    </Link>
                  )}
                  <DataRequestActions id={request.id} status={request.status} />
                </div>
                <p className="text-[12.5px] text-[var(--ink-3)]">Requested {timeAgo(request.requestedAt)}</p>
              </div>
            </Panel>
          ))}
        </div>
      )}
      <Pager info={pageInfo(page, PAGE_SIZE, total)} base="/admin/data-requests" params={{}} noun="requests" />
    </>
  );
}
