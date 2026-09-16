import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const COST = 12;

// A real hash at the same cost, created once. Comparing against it when there
// is no account (or no password yet) makes every failed sign-in take the same
// time, so response timing can't reveal who has an account.
const dummyHash = bcrypt.hash(randomBytes(24).toString("base64url"), COST);

export const hashPassword = (password: string) => bcrypt.hash(password, COST);

export async function verifyPassword(password: string, hash: string | null | undefined) {
  if (hash && hash.length === 60) return bcrypt.compare(password, hash);
  await bcrypt.compare(password, await dummyHash);
  return false;
}
