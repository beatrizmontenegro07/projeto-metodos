import "server-only";

import { AccessDeniedError, InvalidSignInIdentifierError, InvalidSignInPasswordError, SignInError } from "@/modules/auth/errors";
import {
  DuplicatePatientError,
  InvalidAddressError,
  InvalidBirthDateError,
  InvalidCpfError,
  InvalidGenderError,
  InvalidLegalBasisError,
  InvalidPatientEmailError,
  InvalidPatientNameError,
  InvalidPhoneError,
  PatientNotFoundError,
  PatientPersistenceError,
  PatientValidationError,
} from "@/modules/patients/errors";
import {
  DuplicateUserError,
  FirstAdministratorExistsError,
  InvalidLoginError,
  InvalidPasswordError,
  InvalidRoleError,
  UserPersistenceError,
  UserValidationError,
} from "@/modules/users/errors";
import type { FormState } from "@/lib/form-state";

type Failure<Field extends string> = Omit<FormState<Field>, "values">;

/** Errors every form shares; anything else is a bug and reaches the error page. */
function commonFailure<Field extends string>(error: unknown): Failure<Field> {
  if (error instanceof AccessDeniedError) return { error: { scope: "api", code: "ACCESS_DENIED" } };
  if (error instanceof UserPersistenceError || error instanceof PatientPersistenceError) {
    return { error: { scope: "api", code: "STORAGE_UNAVAILABLE" } };
  }
  throw error;
}

export type SignInField = "identifier" | "password";

export function signInFailure(error: unknown): Failure<SignInField> {
  if (!(error instanceof SignInError)) return commonFailure(error);
  const failure = { error: { scope: "auth", code: error.code } } as const;
  if (error instanceof InvalidSignInIdentifierError) return { ...failure, field: "identifier" };
  if (error instanceof InvalidSignInPasswordError) return { ...failure, field: "password" };
  return failure;
}

export type UserField = "name" | "email" | "login" | "password" | "role";

export function userFailure(error: unknown): Failure<UserField> {
  if (error instanceof FirstAdministratorExistsError) return { error: { scope: "users", code: error.code } };
  if (!(error instanceof UserValidationError)) return commonFailure(error);
  return { error: { scope: "users", code: error.code }, field: userFieldOf(error) };
}

function userFieldOf(error: UserValidationError): UserField {
  if (error instanceof InvalidPasswordError) return "password";
  if (error instanceof InvalidRoleError) return "role";
  if (error instanceof InvalidLoginError) return "login";
  if (error instanceof DuplicateUserError && error.code === "EMAIL_ALREADY_REGISTERED") return "email";
  return "login";
}

export type PatientField =
  | "name"
  | "cpf"
  | "birthDate"
  | "gender"
  | "phone"
  | "email"
  | "address"
  | "legalBasis";

const PATIENT_FIELD_BY_ERROR: [errorClass: abstract new (...args: never[]) => PatientValidationError, field: PatientField][] = [
  [InvalidPatientNameError, "name"],
  [InvalidCpfError, "cpf"],
  [DuplicatePatientError, "cpf"],
  [InvalidBirthDateError, "birthDate"],
  [InvalidGenderError, "gender"],
  [InvalidPhoneError, "phone"],
  [InvalidPatientEmailError, "email"],
  [InvalidAddressError, "address"],
  [InvalidLegalBasisError, "legalBasis"],
];

export function patientFailure(error: unknown): Failure<PatientField> {
  if (error instanceof PatientNotFoundError) return { error: { scope: "patients", code: error.code } };
  if (!(error instanceof PatientValidationError)) return commonFailure(error);
  const field = PATIENT_FIELD_BY_ERROR.find(([errorClass]) => error instanceof errorClass)?.[1];
  return { error: { scope: "patients", code: error.code }, field };
}
