import { describe, expect, it } from "vitest";

import { birthDateAsUtc, formatCpf, formatPhone } from "./patient-format";

describe("showing stored patient data", () => {
  it("punctuates the 11 CPF digits", () => {
    expect(formatCpf("12345678909")).toBe("123.456.789-09");
  });

  it.each([
    ["83987654321", "(83) 98765-4321"],
    ["8332221100", "(83) 3222-1100"],
  ])("formats the phone %s as %s", (digits, formatted) => {
    expect(formatPhone(digits)).toBe(formatted);
  });

  it("keeps the birth day whatever the time zone", () => {
    expect(birthDateAsUtc("1985-03-12").toISOString()).toBe("1985-03-12T00:00:00.000Z");
  });
});
