/**
 * Rules for passwords that protect a health record. Shared by the setup form
 * (instant feedback) and the API (the one that counts).
 *
 * Length does most of the work; the list catches the choices attackers try
 * first. No composition rules — they push people toward "Password1!".
 */
export const PASSWORD_MIN = 10;
/** Staff accounts open every client's record, so they get a longer minimum. */
export const STAFF_PASSWORD_MIN = 12;
export const PASSWORD_MAX = 200;

const COMMON = new Set([
  "password", "password1", "password12", "password123", "passw0rd", "p@ssw0rd", "p@ssword",
  "1234567890", "0123456789", "12345678910", "123456789a", "qwertyuiop", "asdfghjkl", "1q2w3e4r5t",
  "iloveyou12", "welcome123", "letmein123", "admin12345", "abcdefghij", "abcd123456",
  "india12345", "india@123", "bharat1234", "mumbai1234", "delhi12345", "pune123456",
  "ozmo123456", "ozmodiet123", "dietplan123", "dietitian1", "healthy123", "fitness123",
  "weightloss", "loseweight", "changeme123", "trustno1234", "sunshine12", "princess12",
]);

export type PasswordContext = { name?: string | null; email?: string | null; phone?: string | null };

/** Why a password isn't acceptable, or null if it is. */
export function passwordProblem(password: string, context: PasswordContext = {}, minLength = PASSWORD_MIN): string | null {
  if (password.length < minLength) return `Use at least ${minLength} characters.`;
  if (password.length > PASSWORD_MAX) return `Use at most ${PASSWORD_MAX} characters.`;

  const lower = password.toLowerCase();
  if (COMMON.has(lower) || COMMON.has(lower.replace(/[^a-z0-9@]/g, ""))) {
    return "That password is too common. Try a short phrase only you would think of.";
  }
  if (/^(.)\1+$/.test(password) || /^(?:0123456789|1234567890|9876543210)+$/.test(password)) {
    return "That password is too easy to guess.";
  }

  const personal = [
    context.email?.split("@")[0],
    ...(context.name?.split(/\s+/) ?? []),
    context.phone?.replace(/\D/g, "").slice(-10),
  ].filter((part): part is string => Boolean(part && part.length >= 4));
  if (personal.some((part) => lower.includes(part.toLowerCase()))) {
    return "Don't use your name, email or phone number in your password.";
  }
  return null;
}
