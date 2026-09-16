import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { asStrings } from "@/lib/json";
import { dayKey, clinicDay } from "@/lib/clinic-time";
import { PageTitle } from "@/components/admin/ui";
import EditClientForm from "@/components/admin/EditClientForm";
import { can } from "@/lib/policy";

export const dynamic = "force-dynamic";

const dateValue = (d: Date | null) => (d ? dayKey(clinicDay(d)) : "");

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  const { id } = await params;

  const client = await prisma.client.findFirst({ where: { id, clinicId: user.clinicId, deletedAt: null }, include: { user: true } });
  if (!client) notFound();

  const dietitians = await prisma.user.findMany({
    where: { clinicId: user.clinicId, role: { in: ["DIETITIAN", "SUPER_ADMIN"] }, isActive: true, deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const clinical = can(user.role, "clients.editClinical");
  // Health values are only sent to the browser for roles allowed to see them.
  const health = can(user.role, "health.read");

  return (
    <>
      <Link href={`/admin/clients/${id}`} className="mb-4 inline-block text-[13.5px] text-[var(--ink-3)] hover:text-[var(--ink)]">
        ← {client.user.name}
      </Link>
      <PageTitle title="Edit client" sub={`${client.clientCode} · changes are recorded in the audit log`} />
      <EditClientForm
        client={{
          id: client.id,
          name: client.user.name,
          phone: client.user.phone ?? "",
          email: client.user.email.endsWith("@no-email.ozmo.local") ? "" : client.user.email,
          city: client.city ?? "",
          occupation: client.occupation ?? "",
          emergencyContact: client.emergencyContact ?? "",
          gender: health ? client.gender ?? "" : "",
          dob: health ? dateValue(client.dob) : "",
          heightCm: health && client.heightCm != null ? String(client.heightCm) : "",
          targetWeightKg: health && client.targetWeightKg != null ? String(client.targetWeightKg) : "",
          targetDate: health ? dateValue(client.targetDate) : "",
          foodPreference: health ? client.foodPreference ?? "" : "",
          allergies: health ? asStrings(client.allergies).join(", ") : "",
          dislikes: health ? asStrings(client.dislikes).join(", ") : "",
          status: client.status,
          primaryDietitianId: client.primaryDietitianId ?? "",
          portalAccess: client.user.isActive,
        }}
        dietitians={dietitians}
        canEditClinical={clinical}
        canChangePortal={can(user.role, "portal.invite")}
      />
    </>
  );
}
