import type { Permission } from "./permissions";

export const SIGN_IN_ERROR_CODES = [
  "SIGN_IN_IDENTIFIER_EMPTY",
  "SIGN_IN_PASSWORD_EMPTY",
  "CREDENTIALS_INCORRECT",
] as const;

export type SignInErrorCode = (typeof SIGN_IN_ERROR_CODES)[number];

/** Base class of every rejected sign-in; the user sees the message at `auth.errors.<code>`. */
export abstract class SignInError extends Error {
  constructor(readonly code: SignInErrorCode) {
    super(code);
  }
}

export class InvalidSignInIdentifierError extends SignInError {
  override name = "InvalidSignInIdentifierError";

  constructor() {
    super("SIGN_IN_IDENTIFIER_EMPTY");
  }
}

export class InvalidSignInPasswordError extends SignInError {
  override name = "InvalidSignInPasswordError";

  constructor() {
    super("SIGN_IN_PASSWORD_EMPTY");
  }
}

/** One error for an unknown login and a wrong password, so a refusal never reveals which users exist. */
export class IncorrectCredentialsError extends SignInError {
  override name = "IncorrectCredentialsError";

  constructor() {
    super("CREDENTIALS_INCORRECT");
  }
}

export class AccessDeniedError extends Error {
  override name = "AccessDeniedError";
  readonly code = "ACCESS_DENIED";

  constructor(readonly permission: Permission) {
    super(`The role does not grant ${permission}.`);
  }
}
