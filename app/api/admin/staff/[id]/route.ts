import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authorize } from "@/lib/auth";
import { isStaffRole } from "@/lib/policy";
import { apiHandler } from "@/lib/api";
import { STAFF_ROLE_VALUES } from "@/lib/staff";

export const runtime = "nodejs";

const schema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    role: z.enum(STAFF_ROLE_VALUES).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "Nothing to change.");

export const PATCH = apiHandler(async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("staff.manage");

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the values." }, { status: 422 });
  }
  const d = parsed.data;
  const { id } = await ctx.params;

  const target = await prisma.user.findFirst({ where: { id, clinicId: session.clinicId, deletedAt: null } });
  if (!target || !isStaffRole(target.role)) return NextResponse.json({ error: "Staff member not found." }, { status: 404 });

  const changesAccess = (d.role !== undefined && d.role !== target.role) || (d.isActive !== undefined && d.isActive !== target.isActive);
  if (target.id === session.sub && changesAccess) {
    return NextResponse.json(
      { error: "You can't change your own role or disable yourself. Ask another administrator." },
      { status: 409 }
    );
  }

  // Never leave the clinic without an active administrator.
  const losesAdmin =
    target.role === "SUPER_ADMIN" && target.isActive &&
    ((d.role !== undefined && d.role !== "SUPER_ADMIN") || d.isActive === false);
  if (losesAdmin) {
    const otherAdmins = await prisma.user.count({
      where: { clinicId: session.clinicId, role: "SUPER_ADMIN", isActive: true, deletedAt: null, id: { not: target.id } },
    });
    if (otherAdmins === 0) {
      return NextResponse.json({ error: "This is the only active administrator. Make someone else an administrator first." }, { status: 409 });
    }
  }

  const changed = Object.entries(d)
    .filter(([key, value]) => value !== undefined && value !== target[key as keyof typeof target])
    .map(([key]) => key);
  if (changed.length === 0) return NextResponse.json({ ok: true });

  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: {
        ...(d.name !== undefined ? { name: d.name } : {}),
        ...(d.role !== undefined ? { role: d.role } : {}),
        ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
        // A role change or deactivation ends their existing sessions immediately.
        ...(changesAccess ? { sessionVersion: { increment: 1 } } : {}),
      },
    }),
    prisma.auditLog.create({
      data: {
        clinicId: session.clinicId, actorId: session.sub,
        action: d.isActive === false ? "STAFF_DISABLED" : d.isActive === true && !target.isActive ? "STAFF_ENABLED" : "STAFF_UPDATED",
        entityType: "User", entityId: id,
        changes: { fields: changed, ...(d.role && d.role !== target.role ? { from: target.role, to: d.role } : {}) },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
});
