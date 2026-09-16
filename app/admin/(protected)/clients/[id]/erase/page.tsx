import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { can } from "@/lib/policy";
import { erasurePreview } from "@/lib/services/erasure";
import { PageTitle, Panel } from "@/components/admin/ui";
import EraseClientForm from "@/components/admin/EraseClientForm";

export const dynamic = "force-dynamic";

export default async function EraseClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ request?: string }>;
}) {
  const user = await requireStaff();
  if (!can(user.role, "privacy.manage")) notFound();
  const [{ id }, { request }] = await Promise.all([params, searchParams]);

  const client = await prisma.client.findFirst({ where: { id, clinicId: user.clinicId }, include: { user: { select: { name: true } } } });
  if (!client) notFound();
  const deletion = request
    ? await prisma.dataRequest.findFirst({ where: { id: request, clientId: id, type: "DELETE", status: { in: ["OPEN", "IN_PROGRESS"] } } })
    : null;
  const preview = await erasurePreview(user.clinicId, id);

  return (
    <>
      <Link href={`/admin/clients/${id}`} className="mb-4 inline-block text-[13.5px] text-[var(--ink-3)] hover:text-[var(--ink)]">
        ← {client.user.name}
      </Link>
      <PageTitle title="Erase client data" sub={`${client.user.name} · ${client.clientCode}`} />

      {preview.alreadyErased ? (
        <Panel className="px-6 py-6">
          <p className="text-[15px] text-[var(--ink-2)]">This client has already been erased.</p>
        </Panel>
      ) : (
        <div className="grid max-w-[760px] gap-6">
          <Panel className="px-6 py-5">
            <p className="text-[14.5px] leading-relaxed text-[var(--ink-2)]">
              {deletion
                ? "This completes the client's deletion request. "
                : "Use this only for a verified deletion request — normally one made from the client's portal. "}
              Erasing removes their personal and health information for good. It can&rsquo;t be undone; the only copies left
              are in backups until those expire. The client is signed out and can no longer sign in.
            </p>
          </Panel>

          <div className="grid gap-6 sm:grid-cols-2">
            <Panel className="px-5 py-5">
              <h2 className="mb-3 text-[15px] font-semibold">Removed</h2>
              <dl className="grid gap-1.5 text-[13.5px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--ink-2)]">Name, contact details and profile</dt>
                  <dd>All</dd>
                </div>
                {Object.entries(preview.summary).map(([label, count]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="text-[var(--ink-2)]">{label}</dt>
                    <dd className="tabular font-semibold">{count}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
            <Panel className="px-5 py-5">
              <h2 className="mb-3 text-[15px] font-semibold">Kept, without personal details</h2>
              <ul className="grid gap-1.5 text-[13.5px] text-[var(--ink-2)]">
                {preview.retained.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </Panel>
          </div>

          <Panel className="border-[var(--alert)]/30 px-6 py-5">
            <EraseClientForm clientId={id} clientCode={client.clientCode} requestId={deletion?.id} />
          </Panel>
        </div>
      )}
    </>
  );
}
