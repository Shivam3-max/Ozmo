import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { nextClientCode, MEAL_SLOTS } from "@/lib/clients";
import { conflict, notFound } from "@/lib/errors";
import { audit, type Actor, type Db } from "@/lib/services/audit";

type Person = { name: string; phone: string; email?: string | null };
type Profile = {
  dob?: Date | null;
  gender?: string | null;
  city?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  foodPreference?: string | null;
  allergies?: string[];
  conditions?: Prisma.InputJsonValue | null;
  healthNote: string;
  weightNote: string;
};

export const placeholderEmail = (phone: string) => `${phone}@no-email.ozmo.local`;

async function assertNewPerson(db: Db, email: string, phone: string) {
  if (await db.user.findFirst({ where: { OR: [{ email }, { phone }] }, select: { id: true } })) {
    throw conflict("Someone already has that email or phone on file.");
  }
}

async function programFor(clinicId: string, slug: string) {
  const program = await prisma.program.findUnique({ where: { clinicId_slug: { clinicId, slug } } });
  if (!program) throw notFound("Programme");
  return program;
}

/**
 * The one way a client record comes into being — manual sign-up and lead
 * conversion both use it, so they always create the same account, enrolment,
 * health record, baseline weight and message thread.
 */
async function createClientRecord(tx: Db, actor: Actor, person: Person, profile: Profile, enrol: { programId: string; durationMonths: number }, assessmentId?: string) {
  const email = person.email || placeholderEmail(person.phone);
  await assertNewPerson(tx, email, person.phone);

  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + enrol.durationMonths);

  return tx.client.create({
    data: {
      clinic: { connect: { id: actor.clinicId } },
      clientCode: await nextClientCode(actor.clinicId),
      // No password yet — the client sets one from their portal invite.
      user: { create: { clinicId: actor.clinicId, role: "CLIENT", name: person.name, email, phone: person.phone } },
      dob: profile.dob ?? null,
      gender: profile.gender || null,
      city: profile.city || null,
      heightCm: profile.heightCm ?? null,
      startWeightKg: profile.weightKg ?? null,
      foodPreference: profile.foodPreference || null,
      allergies: profile.allergies ?? [],
      primaryDietitian: { connect: { id: actor.sub } },
      mealTimes: Object.fromEntries(MEAL_SLOTS.map((m) => [m.slot, m.time])),
      enrollments: {
        create: {
          program: { connect: { id: enrol.programId } },
          durationMonths: enrol.durationMonths,
          startDate: start,
          endDate: end,
          followUpsIncluded: enrol.durationMonths * 2,
          reportsIncluded: enrol.durationMonths,
        },
      },
      ...(assessmentId ? { assessment: { connect: { id: assessmentId } } } : {}),
      healthProfiles: { create: { conditions: profile.conditions ?? undefined, notes: profile.healthNote } },
      // Start the weight history so progress has a baseline.
      ...(profile.weightKg ? { measurements: { create: { weightKg: profile.weightKg, date: start, note: profile.weightNote } } } : {}),
      thread: { create: {} },
    },
  });
}

const raced = (err: unknown) => err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";

export type NewClientInput = {
  name: string; phone: string; email?: string; city?: string; gender?: string; age?: number | null;
  heightCm?: number | null; weightKg?: number | null; foodPreference?: string; allergies: string[]; conditions: string[];
  programSlug: string; durationMonths: number;
};

/** A walk-in who signs up on the spot. */
export async function createClient(actor: Actor & { name: string }, d: NewClientInput) {
  const program = await programFor(actor.clinicId, d.programSlug);
  const now = new Date();
  try {
    return await prisma.$transaction(async (tx) => {
      const created = await createClientRecord(
        tx, actor,
        { name: d.name, phone: d.phone, email: d.email },
        {
          dob: d.age ? new Date(now.getFullYear() - d.age, now.getMonth(), now.getDate()) : null,
          gender: d.gender, city: d.city, heightCm: d.heightCm, weightKg: d.weightKg, foodPreference: d.foodPreference,
          allergies: d.allergies, conditions: d.conditions,
          healthNote: `Added directly by ${actor.name}.`, weightNote: "At sign-up",
        },
        { programId: program.id, durationMonths: d.durationMonths }
      );
      await audit(tx, actor, "CLIENT_CREATED_MANUALLY", { type: "Client", id: created.id }, { program: program.slug, months: d.durationMonths });
      return created;
    });
  } catch (err) {
    if (raced(err)) throw conflict("Someone already has that email or phone on file.");
    throw err;
  }
}

/** A lead becomes a client, carrying over their assessment and bringing their booked appointments with them. */
export async function convertLead(actor: Actor, leadId: string, input: { programSlug: string; durationMonths: number }) {
  const lead = await prisma.lead.findFirst({ where: { id: leadId, clinicId: actor.clinicId }, include: { assessment: true } });
  if (!lead) throw notFound("Lead");
  if (lead.convertedClientId) throw conflict("This lead is already a client.", { clientId: lead.convertedClientId });
  const program = await programFor(actor.clinicId, input.programSlug);
  const a = lead.assessment;

  try {
    return await prisma.$transaction(async (tx) => {
      const created = await createClientRecord(
        tx, actor,
        { name: lead.name, phone: lead.phone, email: lead.email },
        {
          gender: a?.gender, city: lead.city, heightCm: a?.heightCm, weightKg: a?.weightKg, foodPreference: a?.foodPreference,
          conditions: (a?.conditions as Prisma.InputJsonValue | null) ?? null,
          healthNote: a ? "Carried over from the health assessment at conversion." : "Converted from a lead without an assessment.",
          weightNote: "From health assessment",
        },
        { programId: program.id, durationMonths: input.durationMonths },
        a?.id
      );
      await tx.lead.update({ where: { id: leadId }, data: { stage: "CONVERTED", convertedClientId: created.id } });
      // Appointments booked as a lead belong to the client from now on, so they
      // show in the client's file and portal and count against the enrolment.
      await tx.appointment.updateMany({ where: { leadId, clientId: null }, data: { clientId: created.id } });
      await tx.leadActivity.create({ data: { leadId, type: "CONVERTED", note: `${program.name} · ${input.durationMonths} months`, staffId: actor.sub } });
      await audit(tx, actor, "LEAD_CONVERTED", { type: "Client", id: created.id }, { leadId, program: program.slug });
      return created;
    });
  } catch (err) {
    if (raced(err)) throw conflict("A user already exists with that email or phone.");
    throw err;
  }
}
