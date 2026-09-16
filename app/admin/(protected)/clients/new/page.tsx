import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { asArray } from "@/lib/json";
import { PageTitle, Panel } from "@/components/admin/ui";
import NewClientForm from "@/components/admin/NewClientForm";
import { can } from "@/lib/policy";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const user = await requireStaff();
  if (!can(user.role, "clients.create")) {
    return <Panel className="px-6 py-8"><p className="text-[15px] text-[var(--ink-2)]">Creating clients isn&rsquo;t part of your role&rsquo;s access.</p></Panel>;
  }

  const programs = await prisma.program.findMany({
    where: { clinicId: user.clinicId, isActive: true },
    orderBy: { order: "asc" },
    select: { slug: true, name: true, durations: true },
  });

  return (
    <>
      <Link href="/admin/clients" className="mb-4 inline-block text-[13.5px] text-[var(--ink-3)] hover:text-[var(--ink)]">← Clients</Link>
      <PageTitle title="Add a client" sub="For someone who signed up in person, without going through a lead first." />
      <NewClientForm programs={programs.map((p) => ({ ...p, durations: asArray<number>(p.durations) }))} />
    </>
  );
}
