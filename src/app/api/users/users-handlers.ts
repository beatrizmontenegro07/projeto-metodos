import type { NextRequest } from "next/server";

import { DuplicateUserError, UserValidationError } from "@/modules/users/errors";
import type { NewUser } from "@/modules/users/user";

import {
  type ApiContext,
  errorResponse,
  HTTP_BAD_REQUEST,
  HTTP_CONFLICT,
  HTTP_CREATED,
  invalidBodyResponse,
  readTextFields,
  respondAsSignedInUser,
  type Translate,
} from "../api-responses";

const NEW_USER_FIELDS = ["name", "email", "login", "password", "role"] as const;

/**
 * The boundary of user management (UC05, UC06): turns HTTP requests into facade calls on behalf
 * of the signed-in administrator, and failures into `{ error: { code, message } }` in the
 * requester's language.
 */
export function createUsersHandlers(context: ApiContext) {
  return {
    list(request: NextRequest): Promise<Response> {
      return respondAsSignedInUser(
        request,
        context,
        async (facade, actor) => Response.json(await facade.listUsers(actor)),
        userErrorResponse,
      );
    },

    add(request: NextRequest): Promise<Response> {
      return respondAsSignedInUser(
        request,
        context,
        async (facade, actor) => {
          // Only the shape is checked here; the content rules (login, password, role) belong to the domain.
          const newUser = await readTextFields(request, NEW_USER_FIELDS);
          if (!newUser) return invalidBodyResponse(request, NEW_USER_FIELDS);
          return Response.json(await facade.addUser(actor, newUser as NewUser), { status: HTTP_CREATED });
        },
        userErrorResponse,
      );
    },
  };
}

function userErrorResponse(error: unknown, translate: Translate): Response | undefined {
  if (!(error instanceof UserValidationError)) return undefined;
  const status = error instanceof DuplicateUserError ? HTTP_CONFLICT : HTTP_BAD_REQUEST;
  return errorResponse(status, error.code, translate(`users.errors.${error.code}`));
}
