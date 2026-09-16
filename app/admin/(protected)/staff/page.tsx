import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { roleLabel } from "@/lib/staff";
import { formatClinic } from "@/lib/clinic-time";
import { Flag, PageTitle, Panel, th, td } from "@/components/admin/ui";
import { AddStaffForm, StaffRowActions } from "@/components/admin/StaffManager";
import { can } from "@/lib/policy";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const user = await requireStaff();
  if (!can(user.role, "staff.manage")) {
    return (
      <Panel className="px-6 py-8">
        <p className="text-[15px] text-[var(--ink-2)]">Only the clinic administrator can manage staff accounts.</p>
      </Panel>
    );
  }

  const staff = await prisma.user.findMany({
    where: { clinicId: user.clinicId, deletedAt: null, role: { not: "CLIENT" } },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, passwordHash: true, inviteExpiresAt: true },
  });

  const active = staff.filter((s) => s.isActive).length;

  return (
    <>
      <PageTitle title="Staff" sub={`${active} active · ${staff.length - active} disabled`} />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr>
                  <th className={th}>Person</th>
                  <th className={th}>Role</th>
                  <th className={th}>Last signed in</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className={s.isActive ? "" : "opacity-70"}>
                    <td className={td}>
                      <span className="font-semibold">{s.name}</span>
                      <span className="block break-all text-[12.5px] text-[var(--ink-3)]">{s.email}</span>
                      <span className="mt-1 flex flex-wrap gap-1.5">
                        {!s.isActive && <Flag tone="alert">disabled</Flag>}
                        {s.isActive && !s.passwordHash && <Flag tone="watch">hasn&rsquo;t set a password</Flag>}
                      </span>
                    </td>
                    <td className={`${td} whitespace-nowrap`}>{roleLabel(s.role)}</td>
                    <td className={`${td} tabular whitespace-nowrap text-[13.5px] text-[var(--ink-2)]`}>
                      {s.lastLoginAt ? formatClinic(s.lastLoginAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Never"}
                    </td>
                    <td className={`${td} text-right`}>
                      <StaffRowActions id={s.id} name={s.name} role={s.role} isActive={s.isActive} isSelf={s.id === user.sub} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="px-5 py-5">
          <h2 className="mb-1 text-[15px] font-semibold">Add a staff member</h2>
          <p className="mb-4 text-[13.5px] leading-relaxed text-[var(--ink-2)]">
            They get a one-time link to choose their own password. Give each person their own account — never share one.
          </p>
          <AddStaffForm />
        </Panel>
      </div>
    </>
  );
}
