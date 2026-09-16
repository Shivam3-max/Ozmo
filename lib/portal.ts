import { prisma } from "@/lib/db";
import { asStrings } from "@/lib/json";
import { getSession } from "@/lib/auth";
import { addDays, clinicDay, clinicWeekday, dayKey, daysBetween } from "@/lib/clinic-time";

/** The signed-in client's full record. Everything in the portal scopes through this. */
export async function currentClient() {
  const session = await getSession("client");
  if (!session || session.role !== "CLIENT") return null;

  return prisma.client.findFirst({
    where: { userId: session.sub, deletedAt: null },
    include: {
      user: true,
      enrollments: { orderBy: { startDate: "desc" }, take: 1, include: { program: true } },
      primaryDietitian: true,
      dataRequests: { orderBy: { requestedAt: "desc" }, take: 1 },
    },
  });
}

/**
 * The plan rows that apply today. A SINGLE plan repeats; a WEEK plan follows the
 * weekday; a SEQUENCE plan counts days from the programme start. Every-day rows
 * (index -1) always apply. "Today" is the clinic's calendar day.
 */
export async function todaysPlan(clientId: string, enrollmentStart?: Date | null) {
  const plan = await prisma.dietPlan.findFirst({
    where: { clientId, status: "ACTIVE" },
    orderBy: { version: "desc" },
    include: {
      days: { orderBy: { index: "asc" }, include: { slots: { orderBy: { order: "asc" }, include: { items: { orderBy: { order: "asc" } } } } } },
      sections: { orderBy: { order: "asc" } },
    },
  });
  if (!plan) return null;

  let index = 0;
  if (plan.dayMode === "WEEK") {
    index = clinicWeekday();
  } else if (plan.dayMode === "SEQUENCE") {
    const from = plan.startDate ?? enrollmentStart ?? plan.publishedAt ?? plan.createdAt;
    const elapsed = daysBetween(clinicDay(from), clinicDay());
    index = plan.dayCount > 0 ? ((elapsed % plan.dayCount) + plan.dayCount) % plan.dayCount : 0;
  }

  const everyDay = plan.days.find((d) => d.index === -1);
  const day = plan.days.find((d) => d.index === index) ?? plan.days.find((d) => d.index >= 0);

  return {
    plan,
    dayLabel: day?.label ?? "Today",
    slots: [...(everyDay?.slots ?? []), ...(day?.slots ?? [])],
  };
}

export type ScoreBreakdown = {
  score: number;
  band: "Just started" | "Excellent" | "On track" | "Slipping" | "Let's reset";
  /** How many days the score covers — fewer than 7 in a client's first week. */
  days: number;
  parts: { label: string; weight: number; earned: number; detail: string }[];
};

const SCORE_WINDOW = 7;

/**
 * The Ozmo Score, over the last 7 days — or fewer in a client's first week, so
 * nobody is marked down for days before they started. Always shown with its
 * components — a score you can't understand is a score you stop trusting. It
 * never goes red: below 50 it turns amber, and the copy invites a conversation.
 */
export async function ozmoScore(clientId: string, programmeStart?: Date | null): Promise<ScoreBreakdown> {
  const today = clinicDay();
  const sinceStart = programmeStart ? daysBetween(clinicDay(programmeStart), today) + 1 : SCORE_WINDOW;
  const days = Math.max(1, Math.min(SCORE_WINDOW, sinceStart));
  const since = addDays(today, -(days - 1));

  const [logs, water, weighIns, plan] = await Promise.all([
    prisma.foodLog.findMany({ where: { clientId, date: { gte: since } } }),
    prisma.waterLog.findMany({ where: { clientId, date: { gte: since } } }),
    prisma.measurement.count({
      where: { clientId, date: { gte: addDays(today, -(SCORE_WINDOW - 1)) }, weightKg: { not: null } },
    }),
    prisma.dietPlan.findFirst({
      where: { clientId, status: "ACTIVE" },
      orderBy: { version: "desc" },
      include: { days: { include: { slots: true } } },
    }),
  ]);

  // Slots per day, so adherence is measured against her actual plan, not a guess.
  const slotsPerDay = plan
    ? Math.max(
        1,
        (plan.days.find((d) => d.index === -1)?.slots.length ?? 0) +
          (plan.days.find((d) => d.index >= 0)?.slots.length ?? 0)
      )
    : 6;
  // Only rows that exist in the plan count towards adherence.
  const planLabels = new Set(plan?.days.flatMap((d) => d.slots.map((s) => s.label)) ?? []);

  const planned = slotsPerDay * days;
  const followed = logs.filter((l) => l.source !== "OFF_PLAN" && (!plan || planLabels.has(l.slotLabel))).length;
  const adherence = Math.min(1, planned ? followed / planned : 0);

  const daysLogged = new Set(logs.map((l) => dayKey(l.date))).size;
  const consistency = Math.min(1, daysLogged / days);

  const hydrationDays = water.filter((w) => w.glasses >= (w.targetGlasses || 8)).length;
  const hydration = Math.min(1, hydrationDays / days);

  const weighing = Math.min(1, weighIns / 1);

  const dayWord = days === 1 ? "day" : "days";
  const parts = [
    { label: "Meal adherence", weight: 40, earned: adherence, detail: `${followed} of ${planned} planned rows` },
    { label: "Logging consistency", weight: 30, earned: consistency, detail: `${daysLogged} of ${days} ${dayWord}` },
    { label: "Hydration", weight: 20, earned: hydration, detail: `${hydrationDays} of ${days} ${dayWord} on target` },
    { label: "Weigh-in", weight: 10, earned: weighing, detail: weighIns ? "recorded" : "not yet this week" },
  ];

  const score = Math.round(parts.reduce((n, p) => n + p.weight * p.earned, 0));
  const band: ScoreBreakdown["band"] =
    days < 3 && score < 70 ? "Just started"
    : score >= 85 ? "Excellent"
    : score >= 70 ? "On track"
    : score >= 50 ? "Slipping"
    : "Let's reset";

  return { score, band, days, parts };
}

export const BAND_COPY: Record<ScoreBreakdown["band"], string> = {
  "Just started": "Your score builds over your first week. Tick off each meal as you go — it counts from the day you started.",
  Excellent: "You've been very consistent this week. This is exactly what makes the difference over months.",
  "On track": "Solid week. The consistency is there.",
  Slipping: "A quieter week. It happens — the fastest way back is just to log tomorrow's breakfast.",
  "Let's reset": "This week got away from you. That's fine, and it's fixable. Message your dietitian if something isn't working — the plan can change.",
};

/** Consecutive clinic days with at least one log, with a fortnightly grace day. */
export async function currentStreak(clientId: string) {
  const logs = await prisma.foodLog.findMany({
    where: { clientId },
    select: { date: true },
    orderBy: { date: "desc" },
    take: 400,
  });
  const days = new Set(logs.map((l) => dayKey(l.date)));

  let streak = 0;
  let graceUsed = false;
  let cursor = clinicDay();

  // Today not being logged yet shouldn't break a streak mid-morning.
  if (!days.has(dayKey(cursor))) cursor = addDays(cursor, -1);

  for (let i = 0; i < 365; i++) {
    if (days.has(dayKey(cursor))) {
      streak += 1;
    } else if (!graceUsed && streak > 0) {
      graceUsed = true; // one missed day is forgiven, once
    } else {
      break;
    }
    cursor = addDays(cursor, -1);
  }

  return { current: streak, graceUsed };
}

export async function todaysLogs(clientId: string) {
  const today = clinicDay();
  const [logs, water] = await Promise.all([
    prisma.foodLog.findMany({ where: { clientId, date: today } }),
    prisma.waterLog.findUnique({ where: { clientId_date: { clientId, date: today } } }).catch(() => null),
  ]);
  return { logs, water };
}

export const sectionLines = (items: unknown) => asStrings(items);
