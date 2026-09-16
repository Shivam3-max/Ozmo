import { z } from "zod";
import { questions, answerProblem } from "@/lib/assessment";
import { normalizePhone } from "@/lib/phone";

/** Accepts the ways people type a number; outputs the one stored form (+919888877777). */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Please enter a phone number")
  .transform((value, ctx) => {
    const normalized = normalizePhone(value);
    if (!normalized) {
      ctx.addIssue({ code: "custom", message: "Please enter a valid phone number, with the country code if it isn't Indian" });
      return z.NEVER;
    }
    return normalized;
  });

const phone = phoneSchema;

/** A date or date-time string that actually parses; empty means "not given". */
export const dateInputSchema = z
  .string()
  .trim()
  .max(40)
  .refine((v) => v === "" || !Number.isNaN(new Date(v).getTime()), "Enter a valid date");

const name = z.string().trim().min(1, "Please tell us your name").max(120);

const questionById = new Map(questions.map((q) => [q.id, q]));

const assessmentAnswers = z.record(z.string(), z.unknown()).superRefine((answers, ctx) => {
  for (const [key, value] of Object.entries(answers)) {
    const q = questionById.get(key);
    if (!q) {
      ctx.addIssue({ code: "custom", path: [key], message: "Unknown assessment answer." });
      continue;
    }
    const problem = answerProblem(q, value);
    if (problem) ctx.addIssue({ code: "custom", path: [key], message: problem });
  }
  if (JSON.stringify(answers).length > 50_000) {
    ctx.addIssue({ code: "custom", message: "Assessment is too large." });
  }
});

export const assessmentSchema = z.object({
  answers: assessmentAnswers,
  contact: z.object({
    email: z.string().trim().email("Please enter a valid email").max(200),
    phone,
    city: z.string().trim().max(120).optional().or(z.literal("")),
    consentService: z.literal(true, { message: "We need your consent to prepare your snapshot" }),
    consentMarketing: z.boolean().default(false),
  }),
}).strict();

export const bookingSchema = z.object({
  type: z.enum(["clinic", "video"]),
  date: z.string().trim().min(1, "Please choose a date").max(60),
  time: z.string().trim().min(1, "Please choose a time").max(20),
  name,
  phone,
  email: z.string().trim().email("Please enter a valid email").max(200),
  reason: z.string().trim().min(1, "Please choose a reason").max(120),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  acceptTerms: z.literal(true, { message: "Please accept the terms to continue" }),
  acceptDisclaimer: z.literal(true, { message: "Please confirm you've read the disclaimer" }),
});

export const contactSchema = z.object({
  name,
  phone,
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  topic: z.string().trim().min(1, "Please choose a topic").max(120),
  message: z.string().trim().min(1, "Please write a message").max(4000),
  consent: z.literal(true, { message: "We need your consent to reply" }),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(200),
  password: z.string().min(1, "Enter your password").max(200),
});

export type AssessmentInput = z.infer<typeof assessmentSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ContactInput = z.infer<typeof contactSchema>;

/** Turns a ZodError into { field: message } for form display. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
