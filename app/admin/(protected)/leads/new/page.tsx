import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { PageTitle } from "@/components/admin/ui";
import NewLeadForm from "@/components/admin/NewLeadForm";

export default async function NewLeadPage() {
  await requireStaff();
  return (
    <>
      <Link href="/admin/leads" className="mb-4 inline-block text-[13.5px] text-[var(--ink-3)] hover:text-[var(--ink)]">← Leads</Link>
      <PageTitle title="Add a lead" sub="For walk-ins, phone enquiries and referrals that didn't come through the website." />
      <NewLeadForm />
    </>
  );
}
