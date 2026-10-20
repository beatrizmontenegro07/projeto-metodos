import { describe, expect, it } from "vitest";

import { createSessionToken, readSessionSecret, readSessionToken, SESSION_DURATION_IN_SECONDS } from "./session-token";

const SECRET = readSessionSecret("a-test-secret-with-at-least-32-characters");
const SIGNED_IN_AT = new Date("2026-10-19T08:00:00Z");
const ANA = { userId: 1, login: "ana" };

function secondsAfterSignIn(seconds: number) {
  return new Date(SIGNED_IN_AT.getTime() + seconds * 1000);
}

describe("session token", () => {
  it("proves who signed in until it expires", async () => {
    const { token, expiresAt } = await createSessionToken(ANA, SECRET, SIGNED_IN_AT);

    expect(expiresAt).toEqual(secondsAfterSignIn(SESSION_DURATION_IN_SECONDS));
    expect(await readSessionToken(token, SECRET, secondsAfterSignIn(60))).toEqual(ANA);
  });

  it("ends after 8 hours", async () => {
    const { token } = await createSessionToken(ANA, SECRET, SIGNED_IN_AT);

    expect(await readSessionToken(token, SECRET, secondsAfterSignIn(SESSION_DURATION_IN_SECONDS + 1))).toBeUndefined();
  });

  it("rejects a token signed with another secret", async () => {
    const otherSecret = readSessionSecret("another-secret-that-also-has-32-characters");
    const { token } = await createSessionToken(ANA, otherSecret, SIGNED_IN_AT);

    expect(await readSessionToken(token, SECRET, SIGNED_IN_AT)).toBeUndefined();
  });

  it("rejects a tampered token", async () => {
    const { token } = await createSessionToken(ANA, SECRET, SIGNED_IN_AT);
    const [header, payload, signature] = token.split(".");
    const tamperedPayload = Buffer.from(JSON.stringify({ sub: "2", login: "carla" })).toString("base64url");

    expect(await readSessionToken(`${header}.${tamperedPayload}.${signature}`, SECRET, SIGNED_IN_AT)).toBeUndefined();
    expect(payload).not.toBe(tamperedPayload);
  });

  it.each([undefined, "", "not-a-token"])("treats %j as no session", async (token) => {
    expect(await readSessionToken(token, SECRET)).toBeUndefined();
  });

  it.each([undefined, "", "short"])("refuses the secret %j with a clear message", (value) => {
    expect(() => readSessionSecret(value)).toThrow("SESSION_SECRET must have at least 32 characters.");
  });
});
