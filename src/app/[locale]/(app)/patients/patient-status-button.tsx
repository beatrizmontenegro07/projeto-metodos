"use client";

import { UserCheckIcon, UserXIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { useFormErrorMessage } from "@/components/form-error-message";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { FormError } from "@/lib/form-state";

import { setPatientActive } from "./actions";

type PatientStatusButtonProps = {
  patientId: number;
  patientName: string;
  active: boolean;
  size?: React.ComponentProps<typeof Button>["size"];
};

/** RF13: inactivation asks for confirmation; reactivation happens at once. */
export function PatientStatusButton({ patientId, patientName, active, size = "default" }: PatientStatusButtonProps) {
  const t = useTranslations("patients.status");
  const errorMessage = useFormErrorMessage();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<FormError>();
  const [open, setOpen] = useState(false);

  function changeStatus(nextActive: boolean) {
    startTransition(async () => {
      const result = await setPatientActive(patientId, nextActive);
      setError(result.error);
      if (!result.error) setOpen(false);
    });
  }

  if (!active) {
    return (
      <Button variant="outline" size={size} disabled={pending} onClick={() => changeStatus(true)} title={error && errorMessage(error)}>
        {pending ? <Spinner /> : <UserCheckIcon />}
        {t("reactivate")}
      </Button>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="outline" size={size} />}>
        <UserXIcon />
        {t("deactivate")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <UserXIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>{t("confirmTitle", { name: patientName })}</AlertDialogTitle>
          <AlertDialogDescription>
            {error ? <span className="text-destructive">{errorMessage(error)}</span> : t("confirmDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={() => changeStatus(false)}>
            {pending && <Spinner />}
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
