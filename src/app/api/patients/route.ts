import { connection, type NextRequest } from "next/server";

import { getRequestUser } from "@/infra/auth/session";
import { getFacade } from "@/infra/facade";

import { createPatientsHandlers } from "./patients-handlers";

const handlers = createPatientsHandlers({ getFacade, authenticate: getRequestUser });

export async function GET(request: NextRequest) {
  // The list changes at runtime, so it must not be prerendered at build time.
  await connection();
  return handlers.search(request);
}

export function POST(request: NextRequest) {
  return handlers.add(request);
}
