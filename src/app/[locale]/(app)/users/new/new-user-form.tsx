"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { FormAlert } from "@/components/form-alert";
import { FormField } from "@/components/form-field";
import { OptionSelect, type SelectOption } from "@/components/option-select";
import { PasswordInput } from "@/components/password-input";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FormState } from "@/lib/form-state";

import type { UserField } from "../../../form-failures";
import { addUser } from "../actions";

const INITIAL_STATE: FormState<UserField> = { values: {} };

/** TL01 — a refusal keeps every field except the password (NF-SEG-01). */
export function NewUserForm({ roles }: { roles: SelectOption[] }) {
  const t = useTranslations("users");
  const [state, formAction, pending] = useActionState(addUser, INITIAL_STATE);

  return (
    <form action={formAction} className="max-w-xl">
      <FieldGroup>
        <FormAlert state={state} />
        <FormField name="name" label={t("fields.name")} state={state}>
          {(control) => <Input {...control} autoComplete="off" required />}
        </FormField>
        <FormField name="email" label={t("fields.email")} state={state}>
          {(control) => <Input {...control} type="email" autoComplete="off" required />}
        </FormField>
        <FormField name="login" label={t("fields.login")} description={t("fields.loginHint")} state={state}>
          {(control) => <Input {...control} autoComplete="off" required />}
        </FormField>
        <FormField name="password" label={t("fields.password")} description={t("fields.passwordHint")} state={state}>
          {(control) => <PasswordInput {...control} autoComplete="new-password" required />}
        </FormField>
        <FormField name="role" label={t("fields.role")} state={state}>
          {(control) => (
            <OptionSelect
              key={state.values.role}
              {...control}
              options={roles}
              placeholder={t("new.rolePlaceholder")}
              required
            />
          )}
        </FormField>
        <div className="flex justify-end gap-2">
          <Button variant="outline" render={<Link href="/users" />}>
            {t("new.cancel")}
          </Button>
          <SubmitButton pending={pending} label={t("new.submit")} pendingLabel={t("new.submitting")} />
        </div>
      </FieldGroup>
    </form>
  );
}
