import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("verifying a password against its stored hash", () => {
  it("accepts the password that produced the hash", async () => {
    expect(await verifyPassword("Secret@123", await hashPassword("Secret@123"))).toBe(true);
  });

  it("rejects a different password", async () => {
    expect(await verifyPassword("Wrong@123", await hashPassword("Secret@123"))).toBe(false);
  });

  it("salts every hash, so the same password never repeats a hash", async () => {
    expect(await hashPassword("Secret@123")).not.toBe(await hashPassword("Secret@123"));
  });

  it.each(["", "salt-without-key", "salt:not-hex", "salt:abcd"])("rejects the malformed hash %j", async (hash) => {
    expect(await verifyPassword("Secret@123", hash)).toBe(false);
  });
});
