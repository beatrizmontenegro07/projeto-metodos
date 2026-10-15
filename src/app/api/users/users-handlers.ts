import { createTranslator } from "next-intl";
import type { NextRequest } from "next/server";

import { loadMessages } from "@/i18n/messages";
import { resolveRequestLocale } from "@/i18n/request-locale";
import { DuplicateUserError, UserPersistenceError, UserValidationError } from "@/modules/users/errors";
import type { NewUser } from "@/modules/users/user";
import type { UserController } from "@/modules/users/user-controller";

const HTTP_CREATED = 201;
const HTTP_BAD_REQUEST = 400;
const HTTP_CONFLICT = 409;
const HTTP_SERVICE_UNAVAILABLE = 503;

const NEW_USER_TEXT_FIELDS = ["name", "email", "login", "password", "role"] as const;

type ApiErrorCode = "INVALID_REQUEST_BODY" | "STORAGE_UNAVAILABLE";

/**
 * The boundary of user management (UC05, UC06): turns HTTP requests into UserController
 * calls and failures into `{ error: { code, message } }`, with the message in the
 * requester's language. Takes the controller factory so tests can choose the repository.
 */
export function createUsersHandlers(getController: () => Promise<UserController>) {
  return {
    async list(request: NextRequest): Promise<Response> {
      try {
        const controller = await getController();
        return Response.json(await controller.list());
      } catch (error) {
        return failureResponse(request, error);
      }
    },

    async add(request: NextRequest): Promise<Response> {
      const newUser = await readNewUser(request);
      if (!newUser) return apiErrorResponse(request, HTTP_BAD_REQUEST, "INVALID_REQUEST_BODY");
      try {
        const controller = await getController();
        return Response.json(await controller.add(newUser), { status: HTTP_CREATED });
      } catch (error) {
        return failureResponse(request, error);
      }
    },
  };
}

async function readNewUser(request: NextRequest): Promise<NewUser | undefined> {
  const body: unknown = await request.json().catch(() => undefined);
  return isNewUserBody(body) ? body : undefined;
}

// Only the shape is checked here; the content rules (login, password, role) belong to the domain.
function isNewUserBody(body: unknown): body is NewUser {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return false;
  const fields = body as Record<string, unknown>;
  return NEW_USER_TEXT_FIELDS.every((field) => typeof fields[field] === "string");
}

async function failureResponse(request: NextRequest, error: unknown): Promise<Response> {
  if (error instanceof UserValidationError) {
    const status = error instanceof DuplicateUserError ? HTTP_CONFLICT : HTTP_BAD_REQUEST;
    const translate = await translatorFor(request);
    return Response.json(
      { error: { code: error.code, message: translate(`users.errors.${error.code}`) } },
      { status },
    );
  }
  if (error instanceof UserPersistenceError) {
    return apiErrorResponse(request, HTTP_SERVICE_UNAVAILABLE, "STORAGE_UNAVAILABLE");
  }
  throw error;
}

async function apiErrorResponse(request: NextRequest, status: number, code: ApiErrorCode): Promise<Response> {
  const translate = await translatorFor(request);
  return Response.json({ error: { code, message: translate(`api.errors.${code}`) } }, { status });
}

async function translatorFor(request: NextRequest) {
  const locale = resolveRequestLocale(request);
  return createTranslator({ locale, messages: await loadMessages(locale) });
}
