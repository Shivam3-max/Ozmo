import { z } from "zod";

const phone = z
  .string()
  .trim()
  .min(8, "Please enter a valid phone number")
  .max(20)
  .regex(/^[+\d][\d\s\-()]{7,19}$/, "Please enter a valid phone number");

const name = z.string().trim().min(1, "Please tell us your name").max(120);

export const assessmentSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
  contact: z.object({
    email: z.string().trim().email("Please enter a valid email").max(200),
    phone,
    city: z.string().trim().max(120).optional().or(z.literal("")),
    consentService: z.literal(true, { message: "We need your consent to prepare your snapshot" }),
    consentMarketing: z.boolean().default(false),
  }),
});

export const bookingSchema = z.object({
  type: z.enum(["clinic", "video", "followup"]),
  date: z.string().trim().min(1, "Please choose a date").max(60),
  time: z.string().trim().min(1, "Please choose a time").max(20),
  name,
  phone,
  email: z.string().trim().email("Please enter a valid email").max(200),
  age: z.coerce.number().int().min(13, "Please enter your age").max(100),
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
