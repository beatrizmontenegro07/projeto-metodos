import { createTranslator } from "next-intl";
import type { NextRequest } from "next/server";

import { loadMessages } from "@/i18n/messages";
import { resolveRequestLocale } from "@/i18n/request-locale";
import { AccessDeniedError } from "@/modules/auth/errors";
import type { FacadeSingletonController } from "@/modules/facade/facade-singleton-controller";
import { PatientPersistenceError } from "@/modules/patients/errors";
import { UserPersistenceError } from "@/modules/users/errors";
import type { User } from "@/modules/users/user";

export const HTTP_CREATED = 201;
export const HTTP_NO_CONTENT = 204;
export const HTTP_BAD_REQUEST = 400;
export const HTTP_UNAUTHORIZED = 401;
export const HTTP_FORBIDDEN = 403;
export const HTTP_NOT_FOUND = 404;
export const HTTP_CONFLICT = 409;
export const HTTP_SERVICE_UNAVAILABLE = 503;

type ApiErrorCode = "INVALID_REQUEST_BODY" | "STORAGE_UNAVAILABLE" | "UNAUTHENTICATED" | "ACCESS_DENIED";

/** Translates a message key in the requester's language. */
export type Translate = (key: string, values?: Record<string, string>) => string;

/** A capability's domain errors as responses; undefined for an error it does not own. */
export type DomainErrorResponder = (error: unknown, translate: Translate) => Response | undefined;

/** What every API boundary needs; tests replace both to avoid cookies and real storage. */
export type ApiContext = {
  getFacade: () => Promise<FacadeSingletonController>;
  authenticate: (request: NextRequest) => Promise<User | undefined>;
};

export async function translatorFor(request: NextRequest): Promise<Translate> {
  const locale = resolveRequestLocale(request);
  return createTranslator({ locale, messages: await loadMessages(locale) }) as Translate;
}

/** The error format of every API route: `{ error: { code, message } }`. */
export function errorResponse(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } }, { status });
}

export async function apiErrorResponse(
  request: NextRequest,
  status: number,
  code: ApiErrorCode,
  values?: Record<string, string>,
): Promise<Response> {
  const translate = await translatorFor(request);
  return errorResponse(status, code, translate(`api.errors.${code}`, values));
}

/** Reads a JSON object whose listed fields are text; undefined when the body has another shape. */
export async function readTextFields<Required extends string, Optional extends string = never>(
  request: NextRequest,
  required: readonly Required[],
  optional: readonly Optional[] = [],
): Promise<(Record<Required, string> & Partial<Record<Optional, string>>) | undefined> {
  const body: unknown = await request.json().catch(() => undefined);
  if (typeof body !== "object" || body === null || Array.isArray(body)) return undefined;
  const fields = body as Record<string, unknown>;
  const hasRequired = required.every((field) => typeof fields[field] === "string");
  const hasValidOptional = optional.every((field) => fields[field] === undefined || typeof fields[field] === "string");
  return hasRequired && hasValidOptional ? (fields as Record<Required, string> & Partial<Record<Optional, string>>) : undefined;
}

export function invalidBodyResponse(request: NextRequest, fields: readonly string[]): Promise<Response> {
  return apiErrorResponse(request, HTTP_BAD_REQUEST, "INVALID_REQUEST_BODY", { fields: fields.join(", ") });
}

/**
 * Runs `operation` for the signed-in user and turns the failures shared by every route into
 * responses: 401 without a session, 403 when the role lacks the permission, 503 when storage
 * fails, and the capability's own domain errors through `respondToDomainError`.
 */
export async function respondAsSignedInUser(
  request: NextRequest,
  context: ApiContext,
  operation: (facade: FacadeSingletonController, actor: User) => Promise<Response>,
  respondToDomainError: DomainErrorResponder,
): Promise<Response> {
  try {
    const actor = await context.authenticate(request);
    if (!actor) return apiErrorResponse(request, HTTP_UNAUTHORIZED, "UNAUTHENTICATED");
    return await operation(await context.getFacade(), actor);
  } catch (error) {
    if (error instanceof AccessDeniedError) return apiErrorResponse(request, HTTP_FORBIDDEN, "ACCESS_DENIED");
    if (error instanceof UserPersistenceError || error instanceof PatientPersistenceError) {
      return apiErrorResponse(request, HTTP_SERVICE_UNAVAILABLE, "STORAGE_UNAVAILABLE");
    }
    const domainResponse = respondToDomainError(error, await translatorFor(request));
    if (domainResponse) return domainResponse;
    throw error;
  }
}
