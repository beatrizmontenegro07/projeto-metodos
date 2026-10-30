"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { FormAlert } from "@/components/form-alert";
import { FormField } from "@/components/form-field";
import { PasswordInput } from "@/components/password-input";
import { SubmitButton } from "@/components/submit-button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FormState } from "@/lib/form-state";

import type { SignInField } from "../../form-failures";
import { signIn } from "../actions";

const INITIAL_STATE: FormState<SignInField> = { values: {} };

export function SignInForm() {
  const t = useTranslations("signIn");
  const [state, formAction, pending] = useActionState(signIn, INITIAL_STATE);

  return (
    <form action={formAction}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-balance text-muted-foreground">{t("description")}</p>
        </div>
        <FormAlert state={state} />
        <FormField name="identifier" label={t("identifier")} state={state}>
          {(control) => <Input {...control} autoComplete="username" placeholder="ana" required />}
        </FormField>
        <FormField name="password" label={t("password")} state={state}>
          {(control) => <PasswordInput {...control} autoComplete="current-password" required />}
        </FormField>
        <Field>
          <SubmitButton pending={pending} label={t("submit")} pendingLabel={t("submitting")} />
        </Field>
      </FieldGroup>
    </form>
  );
}
