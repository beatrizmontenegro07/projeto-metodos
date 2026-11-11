import pino from "pino";
import { describe, expect, it } from "vitest";

import { PinoAccessLogger } from "./pino-access-logger";

describe("Pino access logging adapter", () => {
  it("writes a structured sign-in event with only the user id and logging metadata", () => {
    const lines: string[] = [];
    const logger = new PinoAccessLogger(pino({ base: undefined }, {
      write: (line: string) => { lines.push(line); },
    }));

    logger.recordSignIn(42);

    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0])).toEqual({
      level: 30,
      time: expect.any(Number),
      event: "USER_SIGNED_IN",
      userId: 42,
    });
  });
});
