import type { NextRequest } from "next/server";

import type { FacadeSingletonController } from "@/modules/facade/facade-singleton-controller";
import {
  DuplicateUserError,
  FirstAdministratorExistsError,
  UserPersistenceError,
  UserValidationError,
} from "@/modules/users/errors";
import type { User } from "@/modules/users/user";

import {
  apiErrorResponse,
  errorResponse,
  HTTP_BAD_REQUEST,
  HTTP_CONFLICT,
  HTTP_CREATED,
  HTTP_SERVICE_UNAVAILABLE,
  invalidBodyResponse,
  readTextFields,
  translatorFor,
} from "../../api-responses";

const FIRST_ADMINISTRATOR_FIELDS = ["name", "email", "login", "password"] as const;

export type FirstAdministratorContext = {
  getFacade: () => Promise<FacadeSingletonController>;
  startSession: (user: User) => Promise<void>;
};

/** RF16 for API clients: creates the first administrator of an empty system and signs them in. */
export function createFirstAdministratorHandlers(context: FirstAdministratorContext) {
  return {
    async create(request: NextRequest): Promise<Response> {
      const newUser = await readTextFields(request, FIRST_ADMINISTRATOR_FIELDS);
      if (!newUser) return invalidBodyResponse(request, FIRST_ADMINISTRATOR_FIELDS);
      try {
        const administrator = await (await context.getFacade()).createFirstAdministrator(newUser);
        await context.startSession(administrator);
        return Response.json(administrator, { status: HTTP_CREATED });
      } catch (error) {
        return failureResponse(request, error);
      }
    },
  };
}

async function failureResponse(request: NextRequest, error: unknown): Promise<Response> {
  if (error instanceof UserValidationError || error instanceof FirstAdministratorExistsError) {
    const conflict = error instanceof DuplicateUserError || error instanceof FirstAdministratorExistsError;
    const translate = await translatorFor(request);
    return errorResponse(conflict ? HTTP_CONFLICT : HTTP_BAD_REQUEST, error.code, translate(`users.errors.${error.code}`));
  }
  if (error instanceof UserPersistenceError) {
    return apiErrorResponse(request, HTTP_SERVICE_UNAVAILABLE, "STORAGE_UNAVAILABLE");
  }
  throw error;
}
