import { prisma } from "@/lib/db";
import { asStrings } from "@/lib/json";
import { getSession } from "@/lib/auth";

export const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const dayKey = (d: Date) => startOfDay(d).toISOString().slice(0, 10);

/** The signed-in client's full record. Everything in the portal scopes through this. */
export async function currentClient() {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") return null;

  return prisma.client.findFirst({
    where: { userId: session.sub, deletedAt: null },
    include: {
      user: true,
      enrollments: { orderBy: { startDate: "desc" }, take: 1, include: { program: true } },
      primaryDietitian: true,
    },
  });
}

/**
 * The plan rows that apply today. A SINGLE plan repeats; a WEEK plan follows the
 * weekday; a SEQUENCE plan counts days from the programme start. Every-day rows
 * (index -1) always apply.
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

  const today = new Date();
  let index = 0;
  if (plan.dayMode === "WEEK") {
    index = (today.getDay() + 6) % 7; // Monday = 0
  } else if (plan.dayMode === "SEQUENCE") {
    const from = plan.startDate ?? enrollmentStart ?? plan.publishedAt ?? plan.createdAt;
    const elapsed = Math.floor((startOfDay(today).getTime() - startOfDay(from).getTime()) / 864e5);
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
  band: "Excellent" | "On track" | "Slipping" | "Let's reset";
  parts: { label: string; weight: number; earned: number; detail: string }[];
};

/**
 * The Ozmo Score, over a rolling 7 days. Always shown with its components —
 * a score you can't understand is a score you stop trusting. It never goes red:
 * below 50 it turns amber, and the copy invites a conversation.
 */
export async function ozmoScore(clientId: string): Promise<ScoreBreakdown> {
  const since = startOfDay(new Date(Date.now() - 6 * 864e5));

  const [logs, water, weighIns, plan] = await Promise.all([
    prisma.foodLog.findMany({ where: { clientId, date: { gte: since } } }),
    prisma.waterLog.findMany({ where: { clientId, date: { gte: since } } }),
    prisma.measurement.count({ where: { clientId, date: { gte: since }, weightKg: { not: null } } }),
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

  const planned = slotsPerDay * 7;
  const followed = logs.filter((l) => l.source !== "OFF_PLAN").length;
  const adherence = Math.min(1, planned ? followed / planned : 0);

  const daysLogged = new Set(logs.map((l) => dayKey(l.date))).size;
  const consistency = Math.min(1, daysLogged / 7);

  const hydrationDays = water.filter((w) => w.glasses >= (w.targetGlasses || 8)).length;
  const hydration = Math.min(1, hydrationDays / 7);

  const weighing = Math.min(1, weighIns / 1);

  const parts = [
    { label: "Meal adherence", weight: 40, earned: adherence, detail: `${followed} of ${planned} planned rows` },
    { label: "Logging consistency", weight: 30, earned: consistency, detail: `${daysLogged} of 7 days` },
    { label: "Hydration", weight: 20, earned: hydration, detail: `${hydrationDays} of 7 days on target` },
    { label: "Weigh-in", weight: 10, earned: weighing, detail: weighIns ? "recorded" : "not yet this week" },
  ];

  const score = Math.round(parts.reduce((n, p) => n + p.weight * p.earned, 0));
  const band: ScoreBreakdown["band"] =
    score >= 85 ? "Excellent" : score >= 70 ? "On track" : score >= 50 ? "Slipping" : "Let's reset";

  return { score, band, parts };
}

export const BAND_COPY: Record<ScoreBreakdown["band"], string> = {
  Excellent: "You've been very consistent this week. This is exactly what makes the difference over months.",
  "On track": "Solid week. The consistency is there.",
  Slipping: "A quieter week. It happens — the fastest way back is just to log tomorrow's breakfast.",
  "Let's reset": "This week got away from you. That's fine, and it's fixable. Message your dietitian if something isn't working — the plan can change.",
};

/** Consecutive days with at least one log, with a fortnightly grace day. */
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
  const cursor = startOfDay();

  // Today not being logged yet shouldn't break a streak mid-morning.
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  for (let i = 0; i < 365; i++) {
    if (days.has(dayKey(cursor))) {
      streak += 1;
    } else if (!graceUsed && streak > 0) {
      graceUsed = true; // one missed day is forgiven, once
    } else {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return { current: streak, graceUsed };
}

export async function todaysLogs(clientId: string) {
  const today = startOfDay();
  const [logs, water] = await Promise.all([
    prisma.foodLog.findMany({ where: { clientId, date: today } }),
    prisma.waterLog.findUnique({ where: { clientId_date: { clientId, date: today } } }).catch(() => null),
  ]);
  return { logs, water };
}

export const sectionLines = (items: unknown) => asStrings(items);
