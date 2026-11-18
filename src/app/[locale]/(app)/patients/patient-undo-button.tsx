"use client";

import { Undo2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { useFormErrorMessage } from "@/components/form-error-message";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { FormError } from "@/lib/form-state";

import { undoPatientUpdate } from "./actions";

/** RF19: shown only while the patient has an update to undo; undoes it at once. */
export function PatientUndoButton({ patientId }: { patientId: number }) {
  const t = useTranslations("patients.edit");
  const errorMessage = useFormErrorMessage();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<FormError>();

  function undo() {
    startTransition(async () => {
      const result = await undoPatientUpdate(patientId);
      setError(result?.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" disabled={pending} onClick={undo}>
        {pending ? <Spinner /> : <Undo2Icon />}
        {pending ? t("undoing") : t("undo")}
      </Button>
      {error && <p className="text-sm text-destructive">{errorMessage(error)}</p>}
    </div>
  );
}
