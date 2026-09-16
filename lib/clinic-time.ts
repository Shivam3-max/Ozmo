/**
 * Dates as the clinic experiences them, independent of the server's timezone.
 *
 * Hosting runs in UTC while every client is in India, so "today" computed with
 * `setHours(0)` started at 05:30 IST: early-morning logs landed on yesterday
 * and week plans showed the wrong weekday. Everything calendar-shaped goes
 * through here instead.
 *
 * Two kinds of value:
 * - A *day* is a date-only value stored as midnight UTC of the clinic's
 *   calendar date (FoodLog.date, WaterLog.date). "13 Sept" is the same row
 *   whatever timezone reads it.
 * - An *instant* is a real moment (appointments, measurements). Use
 *   clinicMidnight() to query instants by clinic day, and formatClinic() to
 *   display them.
 */

// India has no daylight saving; the offset maths below assumes a zone without
// DST transitions at midnight, which holds for Asia/Kolkata.
export const CLINIC_TIME_ZONE = "Asia/Kolkata";

const DAY_MS = 24 * 60 * 60 * 1000;

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: CLINIC_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
});
const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CLINIC_TIME_ZONE, hourCycle: "h23",
  year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
});

/** The clinic's calendar date for an instant, as "YYYY-MM-DD". */
export function clinicDateKey(at: Date = new Date()) {
  return dateFormatter.format(at);
}

/** The clinic's calendar day containing `at`, as a date-only value. */
export function clinicDay(at: Date = new Date()) {
  return new Date(`${clinicDateKey(at)}T00:00:00.000Z`);
}

/** "YYYY-MM-DD" for a date-only value produced by clinicDay(). */
export const dayKey = (day: Date) => day.toISOString().slice(0, 10);

export const addDays = (day: Date, days: number) => new Date(day.getTime() + days * DAY_MS);

/** Whole calendar days from one date-only value to another. */
export const daysBetween = (from: Date, to: Date) => Math.round((to.getTime() - from.getTime()) / DAY_MS);

/** Monday = 0 … Sunday = 6, in the clinic's calendar. */
export function clinicWeekday(at: Date = new Date()) {
  return (clinicDay(at).getUTCDay() + 6) % 7;
}

function zonedParts(at: Date) {
  const parts = Object.fromEntries(partsFormatter.formatToParts(at).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year), month: Number(parts.month), day: Number(parts.day),
    hour: Number(parts.hour), minute: Number(parts.minute), second: Number(parts.second),
  };
}

/** Hour of the day (0–23) on the clinic's clock. */
export function clinicHour(at: Date = new Date()) {
  return zonedParts(at).hour;
}

/** The instant the clinic's day containing `at` began. */
export function clinicMidnight(at: Date = new Date()) {
  const p = zonedParts(at);
  const wallClockAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const offset = wallClockAsUtc - Math.floor(at.getTime() / 1000) * 1000;
  return new Date(Date.UTC(p.year, p.month - 1, p.day) - offset);
}

/**
 * The instant for a date and time as read off the clinic's wall clock
 * ("2026-09-16", "10:30" → 05:00 UTC). Null if either part isn't a real value.
 */
export function clinicWallTime(date: string, time: string): Date | null {
  const d = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const t = time.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!d || !t) return null;
  const [year, month, day] = [Number(d[1]), Number(d[2]), Number(d[3])];
  const calendar = new Date(Date.UTC(year, month - 1, day));
  if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day) return null;
  const midnight = clinicMidnight(new Date(Date.UTC(year, month - 1, day, 12)));
  return new Date(midnight.getTime() + (Number(t[1]) * 60 + Number(t[2])) * 60_000);
}

/** Formats a real instant on the clinic's clock. */
export function formatClinic(at: Date, options: Intl.DateTimeFormatOptions) {
  return at.toLocaleString("en-IN", { ...options, timeZone: CLINIC_TIME_ZONE });
}
