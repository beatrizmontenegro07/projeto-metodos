import type { NextRequest } from "next/server";

import { startSession } from "@/infra/auth/session";
import { getFacade } from "@/infra/facade";

import { createFirstAdministratorHandlers } from "./first-administrator-handlers";

const handlers = createFirstAdministratorHandlers({ getFacade, startSession });

export function POST(request: NextRequest) {
  return handlers.create(request);
}
