import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStaff, canEditPlans } from "@/lib/auth";
import { CLINIC_ID } from "@/lib/leads";
import { asStrings } from "@/lib/json";
import { PageTitle, Panel } from "@/components/admin/ui";
import FoodForm from "@/components/admin/FoodForm";

export const dynamic = "force-dynamic";

export default async function EditFoodPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  if (!canEditPlans(user.role)) {
    return <Panel className="px-6 py-8"><p className="text-[15px] text-[var(--ink-2)]">Not part of your role&rsquo;s access.</p></Panel>;
  }

  const { id } = await params;
  const [food, usedInPlans] = await Promise.all([
    prisma.food.findFirst({ where: { id, OR: [{ clinicId: CLINIC_ID }, { clinicId: null }] } }),
    prisma.planItem.count({ where: { foodId: id } }),
  ]);
  if (!food) notFound();

  return (
    <>
      <Link href="/admin/foods" className="mb-4 inline-block text-[13.5px] text-[var(--ink-3)] hover:text-[var(--ink)]">← Library</Link>
      <PageTitle
        title={food.name}
        sub={`${food.category}${food.isVerified ? " · verified" : " · not yet verified"}`}
      />
      <FoodForm
        initial={{
          id: food.id,
          name: food.name,
          alternateNames: asStrings(food.alternateNames),
          category: food.category,
          servingUnit: food.servingUnit,
          servingGrams: food.servingGrams,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fibre: food.fibre,
          glycemicTag: food.glycemicTag,
          conditionTags: asStrings(food.conditionTags),
          isVeg: food.isVeg,
          isVegan: food.isVegan,
          isJain: food.isJain,
          allergens: asStrings(food.allergens),
          defaultType: food.defaultType,
          isPrep: food.isPrep,
          isVerified: food.isVerified,
          usedInPlans,
        }}
      />
    </>
  );
}
