import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authorize } from "@/lib/auth";
import { can } from "@/lib/policy";
import { apiHandler } from "@/lib/api";
import { phoneSchema, dateInputSchema } from "@/lib/validation";

export const runtime = "nodejs";

const text = (max: number) => z.string().trim().max(max);
const list = z.array(z.string().trim().min(1).max(80)).max(30);
const optionalNumber = (min: number, max: number) =>
  z.union([z.coerce.number().min(min).max(max), z.literal(""), z.null()]).optional();

/** Anyone on staff may correct contact details. */
const contactSchema = z.object({
  name: text(120).min(1, "Name is required").optional(),
  phone: phoneSchema.optional(),
  email: z.union([z.string().trim().toLowerCase().email("Enter a valid email").max(200), z.literal("")]).optional(),
  city: text(120).optional(),
  occupation: text(120).optional(),
  emergencyContact: text(191).optional(),
});

/** Health and programme details are the dietitian's to change. */
const clinicalSchema = z.object({
  gender: text(30).optional(),
  dob: dateInputSchema.optional(),
  heightCm: optionalNumber(60, 250),
  targetWeightKg: optionalNumber(20, 300),
  targetDate: dateInputSchema.optional(),
  foodPreference: text(60).optional(),
  allergies: list.optional(),
  dislikes: list.optional(),
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "AT_RISK", "ARCHIVED"]).optional(),
  primaryDietitianId: z.union([z.string().min(1).max(40), z.literal("")]).optional(),
});

const schema = contactSchema.merge(clinicalSchema).extend({
  portalAccess: z.boolean().optional(),
}).strict();

const CLINICAL_KEYS = Object.keys(clinicalSchema.shape);
const placeholderEmail = (phone: string) => `${phone}@no-email.ozmo.local`;
const blankToNull = (v: string | undefined) => (v === undefined ? undefined : v === "" ? null : v);
const dateOrNull = (v: string | undefined) => (v === undefined ? undefined : v === "" ? null : new Date(v));
const numberOrNull = (v: number | "" | null | undefined) => (v === undefined ? undefined : v === "" || v === null ? null : v);

export const PATCH = apiHandler(async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authorize("clients.editContact");

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 422 });
  }
  const d = parsed.data;

  const touchesClinical = CLINICAL_KEYS.some((k) => d[k as keyof typeof d] !== undefined);
  if (touchesClinical && !can(session.role, "clients.editClinical")) {
    return NextResponse.json({ error: "Only the dietitian or administrator can change health and programme details." }, { status: 403 });
  }
  if (d.portalAccess !== undefined && !can(session.role, "portal.invite")) {
    return NextResponse.json({ error: "Only the dietitian or administrator can turn portal access on or off." }, { status: 403 });
  }

  const { id } = await ctx.params;
  const client = await prisma.client.findFirst({ where: { id, clinicId: session.clinicId, deletedAt: null }, include: { user: true } });
  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  const phone = d.phone ?? client.user.phone ?? "";
  const hadRealEmail = !client.user.email.endsWith("@no-email.ozmo.local");
  const email =
    d.email === undefined
      ? hadRealEmail ? client.user.email : placeholderEmail(phone)
      : d.email || placeholderEmail(phone);

  const clash = await prisma.user.findFirst({
    where: { id: { not: client.userId }, OR: [{ email }, ...(d.phone ? [{ phone: d.phone }] : [])] },
    select: { id: true },
  });
  if (clash) return NextResponse.json({ error: "Another account already uses that email or phone." }, { status: 409 });

  if (d.primaryDietitianId) {
    const dietitian = await prisma.user.findFirst({
      where: { id: d.primaryDietitianId, clinicId: session.clinicId, role: { in: ["DIETITIAN", "SUPER_ADMIN"] }, isActive: true },
    });
    if (!dietitian) return NextResponse.json({ error: "Choose an active dietitian." }, { status: 422 });
  }

  const userData = {
    ...(d.name !== undefined ? { name: d.name } : {}),
    ...(d.phone !== undefined ? { phone: d.phone } : {}),
    ...(email !== client.user.email ? { email } : {}),
    ...(d.portalAccess !== undefined && d.portalAccess !== client.user.isActive
      ? { isActive: d.portalAccess, sessionVersion: { increment: 1 } }
      : {}),
  };

  const clientData = {
    city: blankToNull(d.city),
    occupation: blankToNull(d.occupation),
    emergencyContact: blankToNull(d.emergencyContact),
    gender: blankToNull(d.gender),
    dob: dateOrNull(d.dob),
    heightCm: numberOrNull(d.heightCm),
    targetWeightKg: numberOrNull(d.targetWeightKg),
    targetDate: dateOrNull(d.targetDate),
    foodPreference: blankToNull(d.foodPreference),
    allergies: d.allergies,
    dislikes: d.dislikes,
    status: d.status,
    ...(d.primaryDietitianId !== undefined
      ? d.primaryDietitianId ? { primaryDietitian: { connect: { id: d.primaryDietitianId } } } : { primaryDietitian: { disconnect: true } }
      : {}),
  };

  // Field names only: the audit trail says what changed, not the health values themselves.
  const changedFields = Object.keys(d).filter((k) => d[k as keyof typeof d] !== undefined);

  await prisma.$transaction(async (tx) => {
    if (Object.keys(userData).length) await tx.user.update({ where: { id: client.userId }, data: userData });
    await tx.client.update({ where: { id }, data: clientData });
    await tx.auditLog.create({
      data: {
        clinicId: session.clinicId, actorId: session.sub, action: "CLIENT_UPDATED",
        entityType: "Client", entityId: id, changes: { fields: changedFields },
      },
    });
  });

  return NextResponse.json({ ok: true });
});
