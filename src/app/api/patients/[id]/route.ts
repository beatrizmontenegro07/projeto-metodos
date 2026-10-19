import { connection, type NextRequest } from "next/server";

import { getRequestUser } from "@/infra/auth/session";
import { getFacade } from "@/infra/facade";

import { createPatientsHandlers } from "../patients-handlers";

const handlers = createPatientsHandlers({ getFacade, authenticate: getRequestUser });

export async function GET(request: NextRequest, context: RouteContext<"/api/patients/[id]">) {
  await connection();
  return handlers.get(request, (await context.params).id);
}

export async function PUT(request: NextRequest, context: RouteContext<"/api/patients/[id]">) {
  return handlers.update(request, (await context.params).id);
}

export async function PATCH(request: NextRequest, context: RouteContext<"/api/patients/[id]">) {
  return handlers.changeStatus(request, (await context.params).id);
}
