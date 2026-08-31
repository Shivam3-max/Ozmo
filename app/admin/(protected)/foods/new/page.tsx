import Link from "next/link";
import { requireStaff, canEditPlans } from "@/lib/auth";
import { PageTitle, Panel } from "@/components/admin/ui";
import FoodForm from "@/components/admin/FoodForm";

export default async function NewFoodPage() {
  const user = await requireStaff();
  if (!canEditPlans(user.role)) {
    return <Panel className="px-6 py-8"><p className="text-[15px] text-[var(--ink-2)]">Not part of your role&rsquo;s access.</p></Panel>;
  }
  return (
    <>
      <Link href="/admin/foods" className="mb-4 inline-block text-[13.5px] text-[var(--ink-3)] hover:text-[var(--ink)]">← Library</Link>
      <PageTitle title="Add to the library" sub="Foods, supplements, practices and standing preps all live here." />
      <FoodForm />
    </>
  );
}
