import bcrypt from "bcryptjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { hashPassword, verifyPassword } from "./password";

/**
 * Sign-in must cost the same whether or not the account exists, or response
 * times reveal who has an account. Rather than timing requests (unreliable on a
 * busy machine), check the work done: every failure runs one full bcrypt
 * comparison against a hash of the same cost as real passwords.
 */
const costOf = (hash: string) => Number(hash.split("$")[2]);

// Real cost-12 hashing is deliberately slow (~250 ms each); allow for a busy machine.
describe("verifyPassword", { timeout: 30_000 }, () => {
  afterEach(() => vi.restoreAllMocks());

  it("accepts the right password and rejects the wrong one", async () => {
    const hash = await hashPassword("copper kettle morning");
    expect(costOf(hash)).toBe(12);
    expect(await verifyPassword("copper kettle morning", hash)).toBe(true);
    expect(await verifyPassword("silver lantern evening", hash)).toBe(false);
  });

  it.each([
    ["no account", undefined],
    ["account without a password yet", null],
    ["a malformed stored hash", "not-a-bcrypt-hash"],
  ])("does a full-cost comparison for %s", async (_label, stored) => {
    const compare = vi.spyOn(bcrypt, "compare");
    expect(await verifyPassword("anything at all", stored)).toBe(false);
    expect(compare).toHaveBeenCalledTimes(1);
    const hashUsed = compare.mock.calls[0][1] as string;
    expect(hashUsed).toHaveLength(60);
    expect(costOf(hashUsed)).toBe(12);
  });
});
