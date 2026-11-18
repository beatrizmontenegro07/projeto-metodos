import type { NextRequest } from "next/server";

import { getRequestUser } from "@/infra/auth/session";
import { getFacade } from "@/infra/facade";

import { createPatientsHandlers } from "../../patients-handlers";

const handlers = createPatientsHandlers({ getFacade, authenticate: getRequestUser });

/** RF19: undoes the last update of the patient. */
export async function POST(request: NextRequest, context: RouteContext<"/api/patients/[id]/undo">) {
  return handlers.undoUpdate(request, (await context.params).id);
}
