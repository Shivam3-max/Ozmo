import { prisma } from "@/lib/db";
import { CLINIC_ID } from "@/lib/leads";

/** OZ-2026-0142 — readable, sortable, and safe to say on the phone. */
export async function nextClientCode() {
  const year = new Date().getFullYear();
  const prefix = `OZ-${year}-`;
  const last = await prisma.client.findFirst({
    where: { clientCode: { startsWith: prefix } },
    orderBy: { clientCode: "desc" },
    select: { clientCode: true },
  });
  const n = last ? Number(last.clientCode.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(n).padStart(4, "0")}`;
}

export const MEAL_SLOTS = [
  { slot: "EARLY_MORNING", label: "Early morning", time: "07:00" },
  { slot: "BREAKFAST", label: "Breakfast", time: "08:30" },
  { slot: "MID_MORNING", label: "Mid-morning", time: "11:00" },
  { slot: "LUNCH", label: "Lunch", time: "13:30" },
  { slot: "EVENING", label: "Evening", time: "17:00" },
  { slot: "DINNER", label: "Dinner", time: "20:00" },
] as const;

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Mifflin-St Jeor for BMR, multiplied by an activity factor, then adjusted for
 * the goal. A starting point the dietitian overrides — never a prescription.
 */
export function suggestTargets(opts: {
  weightKg?: number | null;
  heightCm?: number | null;
  age?: number | null;
  gender?: string | null;
  activity?: string | null;
  goal?: string | null;
}) {
  const { weightKg, heightCm, age, gender, activity, goal } = opts;
  if (!weightKg || !heightCm || !age) return null;

  const isFemale = (gender ?? "").toLowerCase().startsWith("f");
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (isFemale ? -161 : 5);

  const factor = activity?.startsWith("Athlete")
    ? 1.725
    : activity?.startsWith("Very active")
    ? 1.6
    : activity?.startsWith("Moderately")
    ? 1.45
    : activity?.startsWith("Lightly")
    ? 1.3
    : 1.2;

  const maintenance = bmr * factor;
  const adjusted = goal === "Lose weight" ? maintenance - 450 : goal === "Gain weight" ? maintenance + 350 : maintenance;
  const calories = Math.round(adjusted / 10) * 10;

  return {
    calories,
    // 1.6 g/kg protein suits both fat loss and muscle retention; carbs take the remainder.
    protein: Math.round(weightKg * 1.6),
    fat: Math.round((calories * 0.27) / 9),
    carbs: Math.round((calories - weightKg * 1.6 * 4 - (calories * 0.27)) / 4),
  };
}

export async function clinicClients() {
  return prisma.client.findMany({
    where: { clinicId: CLINIC_ID, deletedAt: null },
    orderBy: { joinedAt: "desc" },
    include: {
      user: true,
      enrollments: { orderBy: { startDate: "desc" }, take: 1, include: { program: true } },
      measurements: { orderBy: { date: "desc" }, take: 1 },
      dietPlans: { where: { status: "ACTIVE" }, take: 1 },
    },
  });
}
