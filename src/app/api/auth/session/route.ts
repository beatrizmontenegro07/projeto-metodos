import type { NextRequest } from "next/server";

import { endSession, startSession } from "@/infra/auth/session";
import { getFacade } from "@/infra/facade";

import { createSessionHandlers } from "./session-handlers";

const handlers = createSessionHandlers({ getFacade, startSession, endSession });

export function POST(request: NextRequest) {
  return handlers.signIn(request);
}

export function DELETE() {
  return handlers.signOut();
}
