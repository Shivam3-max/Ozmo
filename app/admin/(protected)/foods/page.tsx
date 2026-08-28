import { prisma } from "@/lib/db";
import { requireStaff, canSeeHealthData } from "@/lib/auth";
import { asStrings } from "@/lib/json";
import { PageTitle, Panel, Flag, th, td } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function FoodsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const user = await requireStaff();
  if (!canSeeHealthData(user.role)) {
    return <Panel className="px-6 py-8"><p className="text-[15px] text-[var(--ink-2)]">Not part of your role&rsquo;s access.</p></Panel>;
  }

  const { q = "", category = "" } = await searchParams;
  const foods = await prisma.food.findMany({
    where: {
      ...(q ? { name: { contains: q } } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    take: 400,
  });
  const unverified = foods.filter((f) => !f.isVerified).length;
  const categories = [...new Set(foods.map((f) => f.category))].sort();

  return (
    <>
      <PageTitle
        title="Food database"
        sub={`${foods.length} items · ${unverified} awaiting verification`}
      />

      {unverified > 0 && (
        <Panel className="mb-6 border-[var(--watch)]/30 bg-[var(--watch)]/6 px-6 py-4">
          <p className="text-[14.5px] leading-relaxed text-[var(--ink-2)]">
            <strong className="font-semibold text-[var(--ink)]">These values are indicative.</strong>{" "}
            They were seeded from common composition tables at realistic household portions. Every
            item needs the dietitian&rsquo;s confirmation before a plan built on it goes to a client.
          </p>
        </Panel>
      )}

      <form className="mb-5 flex flex-wrap gap-2" action="/admin/foods">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search foods…"
          className="min-h-[42px] w-[220px] rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 text-[14.5px]"
        />
        <select
          name="category"
          defaultValue={category}
          className="min-h-[42px] rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 text-[14.5px]"
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="min-h-[42px] rounded-full bg-[var(--ink)] px-5 text-[14.5px] font-semibold text-white">
          Filter
        </button>
      </form>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr>
                <th className={th}>Food</th>
                <th className={th}>Category</th>
                <th className={th}>Serving</th>
                <th className={th}>kcal</th>
                <th className={th}>Protein</th>
                <th className={th}>Carbs</th>
                <th className={th}>Fat</th>
                <th className={th}>Fibre</th>
                <th className={th}>Tags</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((f) => (
                <tr key={f.id} className="hover:bg-[var(--tint)]">
                  <td className={td}>
                    <span className="font-semibold">{f.name}</span>
                    {!f.isVeg && <span className="ml-2 text-[11px] font-bold text-[var(--alert)]">NV</span>}
                    {!f.isVerified && <span className="ml-2"><Flag tone="watch">unverified</Flag></span>}
                  </td>
                  <td className={`${td} text-[var(--ink-2)]`}>{f.category}</td>
                  <td className={`${td} tabular text-[var(--ink-2)]`}>1 {f.servingUnit} · {f.servingGrams}g</td>
                  <td className={`${td} tabular font-semibold`}>{f.calories}</td>
                  <td className={`${td} tabular`}>{f.protein}</td>
                  <td className={`${td} tabular`}>{f.carbs}</td>
                  <td className={`${td} tabular`}>{f.fat}</td>
                  <td className={`${td} tabular`}>{f.fibre}</td>
                  <td className={`${td} text-[12.5px] text-[var(--ink-3)]`}>
                    {[f.glycemicTag, ...asStrings(f.conditionTags)].filter(Boolean).join(", ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
