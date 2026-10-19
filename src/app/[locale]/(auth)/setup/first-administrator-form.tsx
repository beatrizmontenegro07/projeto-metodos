"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { FormAlert } from "@/components/form-alert";
import { FormField } from "@/components/form-field";
import { PasswordInput } from "@/components/password-input";
import { SubmitButton } from "@/components/submit-button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FormState } from "@/lib/form-state";

import type { UserField } from "../../form-failures";
import { createFirstAdministrator } from "../actions";

const INITIAL_STATE: FormState<UserField> = { values: {} };

export function FirstAdministratorForm() {
  const t = useTranslations("setup");
  const fields = useTranslations("users.fields");
  const [state, formAction, pending] = useActionState(createFirstAdministrator, INITIAL_STATE);

  return (
    <form action={formAction}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-balance text-muted-foreground">{t("description")}</p>
        </div>
        <FormAlert state={state}>
          {" "}
          <Link href="/login" className="underline underline-offset-4">
            {t("goToSignIn")}
          </Link>
        </FormAlert>
        <FormField name="name" label={fields("name")} state={state}>
          {(control) => <Input {...control} autoComplete="name" required />}
        </FormField>
        <FormField name="email" label={fields("email")} state={state}>
          {(control) => <Input {...control} type="email" autoComplete="email" required />}
        </FormField>
        <FormField name="login" label={fields("login")} description={fields("loginHint")} state={state}>
          {(control) => <Input {...control} autoComplete="username" required />}
        </FormField>
        <FormField name="password" label={fields("password")} description={fields("passwordHint")} state={state}>
          {(control) => <PasswordInput {...control} autoComplete="new-password" required />}
        </FormField>
        <Field>
          <SubmitButton pending={pending} label={t("submit")} pendingLabel={t("submitting")} />
        </Field>
      </FieldGroup>
    </form>
  );
}
