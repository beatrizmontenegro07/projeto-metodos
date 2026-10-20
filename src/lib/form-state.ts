import type { SignInErrorCode } from "@/modules/auth/errors";
import type { PATIENT_ERROR_CODES } from "@/modules/patients/errors";
import type { USER_ERROR_CODES } from "@/modules/users/errors";

/** A failure a Server Action reports to its form; the form translates it at `<scope>.errors.<code>`. */
export type FormError =
  | { scope: "auth"; code: SignInErrorCode }
  | { scope: "users"; code: (typeof USER_ERROR_CODES)[number] }
  | { scope: "patients"; code: (typeof PATIENT_ERROR_CODES)[number] }
  | { scope: "api"; code: "STORAGE_UNAVAILABLE" | "ACCESS_DENIED" };

/** The state a form keeps between submissions: the typed values (never the password) and the error. */
export type FormState<Field extends string> = {
  values: Partial<Record<Field, string>>;
  error?: FormError;
  /** The field the error belongs to; absent for errors about the whole form. */
  field?: Field;
};

export function readFields<Field extends string>(formData: FormData, fields: readonly Field[]): Record<Field, string> {
  return Object.fromEntries(fields.map((field) => [field, String(formData.get(field) ?? "")])) as Record<Field, string>;
}
