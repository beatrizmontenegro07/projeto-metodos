export const USER_VALIDATION_ERROR_CODES = [
  "INVALID_ROLE",
  "INVALID_LOGIN",
  "PASSWORD_POLICY_VIOLATION",
  "PASSWORD_TOO_FEW_CHARACTER_TYPES",
  "EMAIL_ALREADY_REGISTERED",
  "LOGIN_ALREADY_REGISTERED",
] as const;

export type UserValidationErrorCode = (typeof USER_VALIDATION_ERROR_CODES)[number];

/**
 * The message is the code itself: user-facing text lives in the i18n catalogs
 * under `users.errors.<code>`, so every locale translates the same key.
 */
export class UserValidationError extends Error {
  override name = "UserValidationError";

  constructor(readonly code: UserValidationErrorCode) {
    super(code);
  }
}

export class UserPersistenceError extends Error {
  override name = "UserPersistenceError";
}
