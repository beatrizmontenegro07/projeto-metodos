export const LOGIN_ERROR_CODES = ["LOGIN_EMPTY", "LOGIN_TOO_LONG", "LOGIN_HAS_NUMBERS"] as const;

export const PASSWORD_ERROR_CODES = [
  "PASSWORD_TOO_SHORT",
  "PASSWORD_TOO_LONG",
  "PASSWORD_EQUALS_LOGIN",
  "PASSWORD_EQUALS_EMAIL",
  "PASSWORD_TOO_FEW_CHARACTER_TYPES",
] as const;

export const DUPLICATE_USER_ERROR_CODES = ["EMAIL_ALREADY_REGISTERED", "LOGIN_ALREADY_REGISTERED"] as const;

export const USER_VALIDATION_ERROR_CODES = [
  ...LOGIN_ERROR_CODES,
  ...PASSWORD_ERROR_CODES,
  "INVALID_ROLE",
  ...DUPLICATE_USER_ERROR_CODES,
] as const;

export type LoginErrorCode = (typeof LOGIN_ERROR_CODES)[number];
export type PasswordErrorCode = (typeof PASSWORD_ERROR_CODES)[number];
export type DuplicateUserErrorCode = (typeof DUPLICATE_USER_ERROR_CODES)[number];
export type UserValidationErrorCode = (typeof USER_VALIDATION_ERROR_CODES)[number];

/**
 * Base class of every rejected user registration. Each case has its own `code`, and the
 * user sees the message at `users.errors.<code>` in their language; the error message is
 * the code itself so every locale translates the same key.
 */
export abstract class UserValidationError extends Error {
  constructor(readonly code: UserValidationErrorCode) {
    super(code);
  }
}

export class InvalidLoginError extends UserValidationError {
  override name = "InvalidLoginError";

  constructor(override readonly code: LoginErrorCode) {
    super(code);
  }
}

export class InvalidPasswordError extends UserValidationError {
  override name = "InvalidPasswordError";

  constructor(override readonly code: PasswordErrorCode) {
    super(code);
  }
}

export class InvalidRoleError extends UserValidationError {
  override name = "InvalidRoleError";

  constructor() {
    super("INVALID_ROLE");
  }
}

export class DuplicateUserError extends UserValidationError {
  override name = "DuplicateUserError";

  constructor(override readonly code: DuplicateUserErrorCode) {
    super(code);
  }
}

/** RF16: the first administrator can be created only while no user exists. */
export class FirstAdministratorExistsError extends Error {
  override name = "FirstAdministratorExistsError";
  readonly code = "FIRST_ADMINISTRATOR_EXISTS";

  constructor() {
    super("FIRST_ADMINISTRATOR_EXISTS");
  }
}

/** Every user error code the UI translates at `users.errors.<code>`. */
export const USER_ERROR_CODES = [...USER_VALIDATION_ERROR_CODES, "FIRST_ADMINISTRATOR_EXISTS"] as const;

export class UserPersistenceError extends Error {
  override name = "UserPersistenceError";
}
