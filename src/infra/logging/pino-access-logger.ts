import pino, { type Logger } from "pino";

import type { AccessLogger } from "@/modules/auth/access-logger";

/** Object Adapter: translates business events into Pino's structured logging API. */
export class PinoAccessLogger implements AccessLogger {
  constructor(private readonly logger: Logger = pino({ name: "clinicore" })) {}

  recordSignIn(userId: number): void {
    this.logger.info({ event: "USER_SIGNED_IN", userId });
  }
}
