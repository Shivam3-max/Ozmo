import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { PageTitle, Panel } from "@/components/admin/ui";
import FoodForm from "@/components/admin/FoodForm";
import { can } from "@/lib/policy";

export default async function NewFoodPage() {
  const user = await requireStaff();
  if (!can(user.role, "foods.edit")) {
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
