export const PATIENT_NAME_ERROR_CODES = ["PATIENT_NAME_EMPTY", "PATIENT_NAME_TOO_LONG"] as const;
export const CPF_ERROR_CODES = ["CPF_EMPTY", "CPF_WRONG_LENGTH", "CPF_INVALID"] as const;
export const BIRTH_DATE_ERROR_CODES = ["BIRTH_DATE_EMPTY", "BIRTH_DATE_INVALID", "BIRTH_DATE_IN_FUTURE"] as const;
export const PHONE_ERROR_CODES = ["PHONE_EMPTY", "PHONE_INVALID"] as const;
export const LEGAL_BASIS_ERROR_CODES = ["LEGAL_BASIS_MISSING", "LEGAL_BASIS_INVALID"] as const;

export const PATIENT_VALIDATION_ERROR_CODES = [
  ...PATIENT_NAME_ERROR_CODES,
  ...CPF_ERROR_CODES,
  ...BIRTH_DATE_ERROR_CODES,
  "GENDER_INVALID",
  ...PHONE_ERROR_CODES,
  "PATIENT_EMAIL_INVALID",
  "ADDRESS_TOO_LONG",
  ...LEGAL_BASIS_ERROR_CODES,
  "CPF_ALREADY_REGISTERED",
] as const;

export type PatientNameErrorCode = (typeof PATIENT_NAME_ERROR_CODES)[number];
export type CpfErrorCode = (typeof CPF_ERROR_CODES)[number];
export type BirthDateErrorCode = (typeof BIRTH_DATE_ERROR_CODES)[number];
export type PhoneErrorCode = (typeof PHONE_ERROR_CODES)[number];
export type LegalBasisErrorCode = (typeof LEGAL_BASIS_ERROR_CODES)[number];
export type PatientValidationErrorCode = (typeof PATIENT_VALIDATION_ERROR_CODES)[number];

/** Every patient error code the UI translates at `patients.errors.<code>`. */
export const PATIENT_ERROR_CODES = [...PATIENT_VALIDATION_ERROR_CODES, "PATIENT_NOT_FOUND"] as const;

/**
 * Base class of every rejected patient registration or edit. Each case has its own `code`,
 * and the user sees the message at `patients.errors.<code>` in their language.
 */
export abstract class PatientValidationError extends Error {
  constructor(readonly code: PatientValidationErrorCode) {
    super(code);
  }
}

export class InvalidPatientNameError extends PatientValidationError {
  override name = "InvalidPatientNameError";

  constructor(override readonly code: PatientNameErrorCode) {
    super(code);
  }
}

export class InvalidCpfError extends PatientValidationError {
  override name = "InvalidCpfError";

  constructor(override readonly code: CpfErrorCode) {
    super(code);
  }
}

export class InvalidBirthDateError extends PatientValidationError {
  override name = "InvalidBirthDateError";

  constructor(override readonly code: BirthDateErrorCode) {
    super(code);
  }
}

export class InvalidGenderError extends PatientValidationError {
  override name = "InvalidGenderError";

  constructor() {
    super("GENDER_INVALID");
  }
}

export class InvalidPhoneError extends PatientValidationError {
  override name = "InvalidPhoneError";

  constructor(override readonly code: PhoneErrorCode) {
    super(code);
  }
}

export class InvalidPatientEmailError extends PatientValidationError {
  override name = "InvalidPatientEmailError";

  constructor() {
    super("PATIENT_EMAIL_INVALID");
  }
}

export class InvalidAddressError extends PatientValidationError {
  override name = "InvalidAddressError";

  constructor() {
    super("ADDRESS_TOO_LONG");
  }
}

export class InvalidLegalBasisError extends PatientValidationError {
  override name = "InvalidLegalBasisError";

  constructor(override readonly code: LegalBasisErrorCode) {
    super(code);
  }
}

export class DuplicatePatientError extends PatientValidationError {
  override name = "DuplicatePatientError";

  constructor() {
    super("CPF_ALREADY_REGISTERED");
  }
}

export class PatientNotFoundError extends Error {
  override name = "PatientNotFoundError";
  readonly code = "PATIENT_NOT_FOUND";

  constructor(readonly patientId: number) {
    super(`Patient ${patientId} does not exist.`);
  }
}

export class PatientPersistenceError extends Error {
  override name = "PatientPersistenceError";
}
