import {
  InvalidAddressError,
  InvalidBirthDateError,
  InvalidCpfError,
  InvalidGenderError,
  InvalidLegalBasisError,
  InvalidPatientEmailError,
  InvalidPatientNameError,
  InvalidPhoneError,
} from "./errors";
import { type Gender, isGender } from "./gender";
import { isLegalBasis, type LegalBasis } from "./legal-basis";
import type { PatientData, PatientInput } from "./patient";

const MAX_NAME_LENGTH = 120;
const MAX_ADDRESS_LENGTH = 200;
const CPF_LENGTH = 11;
const CPF_BASE_LENGTH = 9;
const CPF_CHECK_DIGIT_MODULUS = 11;
// Area code (2 digits) plus an 8-digit landline or a 9-digit mobile number.
const PHONE_LENGTHS = [10, 11];

const CPF_CHARACTERS = /^[\d.\-\s]+$/;
const PHONE_CHARACTERS = /^[\d()\-\s]+$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NON_DIGITS = /\D/g;
const COMBINING_ACCENTS = /[̀-ͯ]/g;

export function onlyDigits(text: string): string {
  return text.replace(NON_DIGITS, "");
}

/** Lowercase text without accents: "João" and "JOAO" share the key "joao", for search and sorting. */
export function toSearchKey(text: string): string {
  return text.normalize("NFD").replace(COMBINING_ACCENTS, "").toLowerCase().trim();
}

export function normalizePatientName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) throw new InvalidPatientNameError("PATIENT_NAME_EMPTY");
  if (trimmed.length > MAX_NAME_LENGTH) throw new InvalidPatientNameError("PATIENT_NAME_TOO_LONG");
  return trimmed;
}

/** Accepts "123.456.789-09" or "12345678909" and returns the 11 digits. */
export function normalizeCpf(cpf: string): string {
  const trimmed = cpf.trim();
  if (trimmed.length === 0) throw new InvalidCpfError("CPF_EMPTY");
  if (!CPF_CHARACTERS.test(trimmed)) throw new InvalidCpfError("CPF_INVALID");
  const digits = onlyDigits(trimmed);
  if (digits.length !== CPF_LENGTH) throw new InvalidCpfError("CPF_WRONG_LENGTH");
  if (!hasValidCpfCheckDigits(digits)) throw new InvalidCpfError("CPF_INVALID");
  return digits;
}

// Receita Federal algorithm: each check digit is derived from the digits before it. A CPF
// with all digits equal passes the arithmetic but is never issued.
function hasValidCpfCheckDigits(digits: string): boolean {
  if (new Set(digits).size === 1) return false;
  return [CPF_BASE_LENGTH, CPF_BASE_LENGTH + 1].every(
    (length) => cpfCheckDigit(digits, length) === Number(digits[length]),
  );
}

function cpfCheckDigit(digits: string, length: number): number {
  let weightedSum = 0;
  for (let position = 0; position < length; position++) {
    weightedSum += Number(digits[position]) * (length + 1 - position);
  }
  const remainder = weightedSum % CPF_CHECK_DIGIT_MODULUS;
  return remainder < 2 ? 0 : CPF_CHECK_DIGIT_MODULUS - remainder;
}

/** Accepts an existing `YYYY-MM-DD` date that is not after `today`. */
export function validateBirthDate(birthDate: string, today: Date): string {
  const trimmed = birthDate.trim();
  if (trimmed.length === 0) throw new InvalidBirthDateError("BIRTH_DATE_EMPTY");
  if (!isExistingIsoDate(trimmed)) throw new InvalidBirthDateError("BIRTH_DATE_INVALID");
  if (trimmed > toIsoDate(today)) throw new InvalidBirthDateError("BIRTH_DATE_IN_FUTURE");
  return trimmed;
}

function isExistingIsoDate(text: string): boolean {
  const parts = ISO_DATE.exec(text);
  if (!parts) return false;
  const [year, month, day] = parts.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function validateGender(gender: string): Gender {
  if (!isGender(gender)) throw new InvalidGenderError();
  return gender;
}

/** Accepts "(83) 98765-4321" or "83987654321" and returns the digits. */
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.length === 0) throw new InvalidPhoneError("PHONE_EMPTY");
  const digits = onlyDigits(trimmed);
  if (!PHONE_CHARACTERS.test(trimmed) || !PHONE_LENGTHS.includes(digits.length)) {
    throw new InvalidPhoneError("PHONE_INVALID");
  }
  return digits;
}

/** A blank e-mail means the patient has none. */
export function normalizeOptionalEmail(email: string | undefined): string | undefined {
  const trimmed = email?.trim() ?? "";
  if (trimmed.length === 0) return undefined;
  if (!EMAIL_FORMAT.test(trimmed)) throw new InvalidPatientEmailError();
  return trimmed.toLowerCase();
}

/** A blank address means the patient has none. */
export function normalizeOptionalAddress(address: string | undefined): string | undefined {
  const trimmed = address?.trim() ?? "";
  if (trimmed.length === 0) return undefined;
  if (trimmed.length > MAX_ADDRESS_LENGTH) throw new InvalidAddressError();
  return trimmed;
}

export function validateLegalBasis(legalBasis: string): LegalBasis {
  if (legalBasis.trim().length === 0) throw new InvalidLegalBasisError("LEGAL_BASIS_MISSING");
  if (!isLegalBasis(legalBasis)) throw new InvalidLegalBasisError("LEGAL_BASIS_INVALID");
  return legalBasis;
}

/** Validates every field in form order and stops at the first broken rule (RF11). */
export function normalizePatientInput(input: PatientInput, today: Date): PatientData {
  return {
    name: normalizePatientName(input.name),
    cpf: normalizeCpf(input.cpf),
    birthDate: validateBirthDate(input.birthDate, today),
    gender: validateGender(input.gender),
    phone: normalizePhone(input.phone),
    email: normalizeOptionalEmail(input.email),
    address: normalizeOptionalAddress(input.address),
    legalBasis: validateLegalBasis(input.legalBasis),
  };
}
