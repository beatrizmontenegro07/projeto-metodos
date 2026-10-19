import type { NextRequest } from "next/server";

import { IncorrectCredentialsError, SignInError } from "@/modules/auth/errors";
import type { FacadeSingletonController } from "@/modules/facade/facade-singleton-controller";
import { UserPersistenceError } from "@/modules/users/errors";
import type { User } from "@/modules/users/user";

import {
  apiErrorResponse,
  errorResponse,
  HTTP_BAD_REQUEST,
  HTTP_NO_CONTENT,
  HTTP_SERVICE_UNAVAILABLE,
  HTTP_UNAUTHORIZED,
  invalidBodyResponse,
  readTextFields,
  translatorFor,
} from "../../api-responses";

const SIGN_IN_FIELDS = ["identifier", "password"] as const;

export type SessionContext = {
  getFacade: () => Promise<FacadeSingletonController>;
  startSession: (user: User) => Promise<void>;
  endSession: () => Promise<void>;
};

/** The sign-in boundary for API clients (UC04): opens and closes the session cookie. */
export function createSessionHandlers(context: SessionContext) {
  return {
    async signIn(request: NextRequest): Promise<Response> {
      const credentials = await readTextFields(request, SIGN_IN_FIELDS);
      if (!credentials) return invalidBodyResponse(request, SIGN_IN_FIELDS);
      try {
        const user = await (await context.getFacade()).signIn(credentials);
        await context.startSession(user);
        return Response.json(user);
      } catch (error) {
        return signInFailureResponse(request, error);
      }
    },

    async signOut(): Promise<Response> {
      await context.endSession();
      return new Response(null, { status: HTTP_NO_CONTENT });
    },
  };
}

async function signInFailureResponse(request: NextRequest, error: unknown): Promise<Response> {
  if (error instanceof SignInError) {
    const status = error instanceof IncorrectCredentialsError ? HTTP_UNAUTHORIZED : HTTP_BAD_REQUEST;
    const translate = await translatorFor(request);
    return errorResponse(status, error.code, translate(`auth.errors.${error.code}`));
  }
  if (error instanceof UserPersistenceError) {
    return apiErrorResponse(request, HTTP_SERVICE_UNAVAILABLE, "STORAGE_UNAVAILABLE");
  }
  throw error;
}
