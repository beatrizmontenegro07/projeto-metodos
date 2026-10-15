import { InvalidLoginError, InvalidPasswordError, InvalidRoleError } from "./errors";
import { isRole } from "./role";

const MAX_LOGIN_LENGTH = 12;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MIN_PASSWORD_CHARACTER_TYPES = 3;

// AWS IAM default password policy: lowercase, uppercase, digit, and symbol.
const PASSWORD_CHARACTER_TYPES = [/\p{Ll}/u, /\p{Lu}/u, /\d/u, /[^\p{L}\d]/u];

/** E-mails are stored and compared without letter case, so "Ana@x.com" and "ana@x.com" are the same user. */
export function normalizeEmail(email: string): string {
  return email.toLowerCase();
}

export function validateRole(role: unknown): void {
  if (!isRole(role)) throw new InvalidRoleError();
}

export function validateLogin(login: unknown): void {
  if (typeof login !== "string" || login.length === 0) throw new InvalidLoginError("LOGIN_EMPTY");
  if (login.length > MAX_LOGIN_LENGTH) throw new InvalidLoginError("LOGIN_TOO_LONG");
  if (/\d/.test(login)) throw new InvalidLoginError("LOGIN_HAS_NUMBERS");
}

export function validatePassword(password: unknown, { login, email }: { login: string; email: string }): void {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    throw new InvalidPasswordError("PASSWORD_TOO_SHORT");
  }
  if (password.length > MAX_PASSWORD_LENGTH) throw new InvalidPasswordError("PASSWORD_TOO_LONG");
  if (password === login) throw new InvalidPasswordError("PASSWORD_EQUALS_LOGIN");
  if (password === email) throw new InvalidPasswordError("PASSWORD_EQUALS_EMAIL");

  const presentCharacterTypes = PASSWORD_CHARACTER_TYPES.filter((characterType) => characterType.test(password));
  if (presentCharacterTypes.length < MIN_PASSWORD_CHARACTER_TYPES) {
    throw new InvalidPasswordError("PASSWORD_TOO_FEW_CHARACTER_TYPES");
  }
}
