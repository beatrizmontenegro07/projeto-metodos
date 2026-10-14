import { UserValidationError } from "./errors";
import { isRole } from "./role";

const MAX_LOGIN_LENGTH = 12;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MIN_PASSWORD_CHARACTER_TYPES = 3;

// AWS IAM default password policy: lowercase, uppercase, digit, and symbol.
const PASSWORD_CHARACTER_TYPES = [/\p{Ll}/u, /\p{Lu}/u, /\d/u, /[^\p{L}\d]/u];

export function validateRole(role: unknown): void {
  if (!isRole(role)) throw new UserValidationError("INVALID_ROLE");
}

export function validateLogin(login: unknown): void {
  if (typeof login !== "string" || login.length === 0 || login.length > MAX_LOGIN_LENGTH || /\d/.test(login)) {
    throw new UserValidationError("INVALID_LOGIN");
  }
}

export function validatePassword(password: unknown, { login, email }: { login: string; email: string }): void {
  if (
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH ||
    password === login ||
    password === email
  ) {
    throw new UserValidationError("PASSWORD_POLICY_VIOLATION");
  }
  const presentCharacterTypes = PASSWORD_CHARACTER_TYPES.filter((characterType) => characterType.test(password));
  if (presentCharacterTypes.length < MIN_PASSWORD_CHARACTER_TYPES) {
    throw new UserValidationError("PASSWORD_TOO_FEW_CHARACTER_TYPES");
  }
}
