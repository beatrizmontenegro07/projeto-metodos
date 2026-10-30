"use client";

import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import type { FormState } from "@/lib/form-state";

import { useFormErrorMessage } from "./form-error-message";

/** Shows an error that belongs to the whole form, not to one field. */
export function FormAlert<Field extends string>({ state, children }: { state: FormState<Field>; children?: React.ReactNode }) {
  const errorMessage = useFormErrorMessage();
  if (!state.error || state.field) return null;

  return (
    <Alert variant="destructive" role="alert">
      <CircleAlertIcon />
      <AlertDescription>
        {errorMessage(state.error)}
        {children}
      </AlertDescription>
    </Alert>
  );
}
