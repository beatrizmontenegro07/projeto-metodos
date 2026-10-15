import { connection, type NextRequest } from "next/server";

import { getUserRepository } from "@/infra/users/user-repository-factory";
import { UserController } from "@/modules/users/user-controller";

import { createUsersHandlers } from "./users-handlers";

const handlers = createUsersHandlers(async () => new UserController(await getUserRepository()));

export async function GET(request: NextRequest) {
  // The list changes at runtime, so it must not be prerendered at build time.
  await connection();
  return handlers.list(request);
}

export function POST(request: NextRequest) {
  return handlers.add(request);
}
