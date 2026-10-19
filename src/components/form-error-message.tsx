"use client";

import { useTranslations } from "next-intl";

import type { FormError } from "@/lib/form-state";

/** Returns the message of a form error in the user's language. */
export function useFormErrorMessage(): (error: FormError) => string {
  const t = useTranslations();
  return (error) => {
    switch (error.scope) {
      case "auth":
        return t(`auth.errors.${error.code}`);
      case "users":
        return t(`users.errors.${error.code}`);
      case "patients":
        return t(`patients.errors.${error.code}`);
      case "api":
        return t(`api.errors.${error.code}`);
    }
  };
}
