import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { asStrings } from "@/lib/json";
import { ITEM_TYPES } from "@/lib/plan-types";
import { PageTitle, Panel, Flag, Empty, th, td } from "@/components/admin/ui";
import VerifyToggle from "@/components/admin/VerifyToggle";
import { pageFrom, pageInfo, paging } from "@/lib/pagination";
import Pager from "@/components/admin/Pager";
import type { Prisma } from "@prisma/client";
import { can } from "@/lib/policy";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 60;

export default async function FoodsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string; page?: string }>;
}) {
  const user = await requireStaff();
  if (!can(user.role, "health.read")) {
    return <Panel className="px-6 py-8"><p className="text-[15px] text-[var(--ink-2)]">Not part of your role&rsquo;s access.</p></Panel>;
  }
  const editable = can(user.role, "foods.edit");
  const { q = "", category = "", status = "", page: rawPage } = await searchParams;
  const page = pageFrom(rawPage);

  const scope = { clinicId: user.clinicId };
  const where: Prisma.FoodWhereInput = {
    ...scope,
    ...(q ? { name: { contains: q } } : {}),
    ...(category ? { category } : {}),
    ...(status === "unverified" ? { isVerified: false } : status === "verified" ? { isVerified: true } : {}),
  };
  // Counts and categories come from aggregates, not by loading the whole library.
  const [allCount, unverified, categoryRows, total, foods] = await Promise.all([
    prisma.food.count({ where: scope }),
    prisma.food.count({ where: { ...scope, isVerified: false } }),
    prisma.food.groupBy({ by: ["category"], where: scope, orderBy: { category: "asc" } }),
    prisma.food.count({ where }),
    prisma.food.findMany({
      where,
      orderBy: [{ isVerified: "asc" }, { category: "asc" }, { name: "asc" }],
      ...paging(page, PAGE_SIZE),
    }),
  ]);
  const all = { length: allCount };
  const categories = categoryRows.map((c) => c.category);
  const shortFor = (t: string) => ITEM_TYPES.find((x) => x.value === t)?.short ?? t;

  return (
    <>
      <PageTitle
        title="Library"
        sub={`${all.length} items · ${unverified} awaiting your check`}
        action={
          editable ? (
            <Link href="/admin/foods/new" className="rounded-full bg-[var(--ink)] px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#163B4D]">
              + Add item
            </Link>
          ) : null
        }
      />

      {unverified > 0 && editable && (
        <Panel className="mb-6 border-[var(--watch)]/30 bg-[var(--watch)]/6 px-6 py-4">
          <p className="text-[14.5px] leading-relaxed text-[var(--ink-2)]">
            <strong className="font-semibold text-[var(--ink)]">{unverified} items still need your check.</strong>{" "}
            They were seeded from common composition tables at typical household portions. Tick the
            circle on any row you&rsquo;re happy with, or open it to correct the numbers first —
            plans built on these reach real clients.{" "}
            <Link href="/admin/foods?status=unverified" className="font-semibold text-[var(--accent-text)]">
              Show only unverified →
            </Link>
          </p>
        </Panel>
      )}

      <form action="/admin/foods" className="mb-3 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search name or alternate name…" className="min-h-[42px] w-[260px] rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 text-[14.5px]" />
        <select name="category" defaultValue={category} className="min-h-[42px] rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 text-[14.5px]">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select name="status" defaultValue={status} className="min-h-[42px] rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 text-[14.5px]">
          <option value="">All items</option>
          <option value="unverified">Unverified only</option>
          <option value="verified">Verified only</option>
        </select>
        <button className="min-h-[42px] rounded-full bg-[var(--ink)] px-5 text-[14px] font-semibold text-white">Filter</button>
        {(q || category || status) && <Link href="/admin/foods" className="self-center text-[13.5px] text-[var(--ink-3)]">Clear</Link>}
      </form>

      <p className="mb-4 text-[13px] text-[var(--ink-3)]">
        {total === all.length ? `${all.length} items` : `${total} of ${all.length} items match`}
        {editable && " · click a row to edit, or tick the circle to verify"}
      </p>

      <Panel>
        {foods.length === 0 ? (
          <Empty title="Nothing matches" body="Try a different search, or clear the filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse">
              <thead>
                <tr>
                  {editable && <th className={`${th} w-[44px]`} />}
                  <th className={th}>Item</th>
                  <th className={th}>Type</th>
                  <th className={th}>Category</th>
                  <th className={th}>Serving</th>
                  <th className={th}>kcal</th>
                  <th className={th}>P</th>
                  <th className={th}>C</th>
                  <th className={th}>F</th>
                  <th className={th}>Fibre</th>
                  <th className={th}>Tags</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((f) => {
                  const tags = [f.glycemicTag, ...asStrings(f.conditionTags)].filter(Boolean);
                  const allergens = asStrings(f.allergens);
                  return (
                    <tr key={f.id} className="group hover:bg-[var(--tint)]">
                      {editable && (
                        <td className={`${td} align-middle`}>
                          <VerifyToggle id={f.id} verified={f.isVerified} />
                        </td>
                      )}
                      <td className={td}>
                        {editable ? (
                          <Link href={`/admin/foods/${f.id}`} className="font-semibold hover:text-[var(--accent-text)]">
                            {f.name}
                          </Link>
                        ) : (
                          <span className="font-semibold">{f.name}</span>
                        )}
                        <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          {!f.isVeg && <span className="text-[11px] font-bold text-[var(--alert)]">NON-VEG</span>}
                          {f.isPrep && <Flag tone="watch">prep</Flag>}
                          {allergens.length > 0 && (
                            <span className="text-[11.5px] text-[var(--ink-3)]">{allergens.join(", ")}</span>
                          )}
                        </span>
                      </td>
                      <td className={`${td} text-[12.5px] font-semibold text-[var(--ink-2)]`}>{shortFor(f.defaultType)}</td>
                      <td className={`${td} text-[var(--ink-2)]`}>{f.category}</td>
                      <td className={`${td} tabular whitespace-nowrap text-[var(--ink-2)]`}>
                        1 {f.servingUnit}{f.servingGrams ? ` · ${f.servingGrams}g` : ""}
                      </td>
                      <td className={`${td} tabular font-semibold`}>{f.calories || "—"}</td>
                      <td className={`${td} tabular`}>{f.protein || "—"}</td>
                      <td className={`${td} tabular`}>{f.carbs || "—"}</td>
                      <td className={`${td} tabular`}>{f.fat || "—"}</td>
                      <td className={`${td} tabular`}>{f.fibre || "—"}</td>
                      <td className={`${td} text-[12.5px] text-[var(--ink-3)]`}>{tags.join(", ") || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <Pager info={pageInfo(page, PAGE_SIZE, total)} base="/admin/foods" params={{ q: q || undefined, category: category || undefined, status: status || undefined }} noun="items" />
    </>
  );
}
