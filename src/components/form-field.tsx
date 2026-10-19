"use client";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import type { FormState } from "@/lib/form-state";

import { useFormErrorMessage } from "./form-error-message";

type FormFieldProps<Field extends string> = {
  name: Field;
  label: string;
  description?: string;
  state: FormState<Field>;
  /** The control, rendered with `id={name}`. */
  children: (control: { id: Field; name: Field; "aria-invalid": boolean; defaultValue?: string }) => React.ReactNode;
};

/** A labelled field that shows the specific message when the last submission failed on it. */
export function FormField<Field extends string>({ name, label, description, state, children }: FormFieldProps<Field>) {
  const errorMessage = useFormErrorMessage();
  const invalid = state.field === name && state.error !== undefined;

  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      {children({ id: name, name, "aria-invalid": invalid, defaultValue: state.values[name] })}
      {description && !invalid && <FieldDescription>{description}</FieldDescription>}
      {invalid && state.error && <FieldError>{errorMessage(state.error)}</FieldError>}
    </Field>
  );
}
