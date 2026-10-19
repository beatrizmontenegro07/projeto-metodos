"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { FormAlert } from "@/components/form-alert";
import { FormField } from "@/components/form-field";
import { OptionSelect, type SelectOption } from "@/components/option-select";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import type { PatientField } from "../../form-failures";
import type { PatientFormState } from "./actions";

type PatientFormProps = {
  action: (previous: PatientFormState, formData: FormData) => Promise<PatientFormState>;
  initialValues?: Partial<Record<PatientField, string>>;
  genders: SelectOption[];
  legalBases: SelectOption[];
  submitLabel: string;
  pendingLabel: string;
};

/** TL04 — the fields of RF11; a refusal shows the rule broken next to its field and keeps the values. */
export function PatientForm({ action, initialValues = {}, genders, legalBases, submitLabel, pendingLabel }: PatientFormProps) {
  const t = useTranslations("patients");
  const [state, formAction, pending] = useActionState(action, { values: initialValues });

  return (
    <form action={formAction} className="max-w-3xl">
      <FieldGroup>
        <FormAlert state={state} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormField name="name" label={t("fields.name")} state={state}>
              {(control) => <Input {...control} autoComplete="off" required />}
            </FormField>
          </div>
          <div className="flex flex-col gap-2">
            <FormField name="cpf" label={t("fields.cpf")} state={state}>
              {(control) => <Input {...control} inputMode="numeric" placeholder="000.000.000-00" required />}
            </FormField>
            {state.existingPatientId !== undefined && (
              <Link href={`/patients/${state.existingPatientId}`} className="text-sm underline underline-offset-4">
                {t("form.viewExisting")}
              </Link>
            )}
          </div>
          <FormField name="birthDate" label={t("fields.birthDate")} state={state}>
            {(control) => <Input {...control} type="date" required />}
          </FormField>
          <FormField name="gender" label={t("fields.gender")} state={state}>
            {(control) => (
              <OptionSelect
                key={state.values.gender}
                {...control}
                options={genders}
                placeholder={t("fields.genderPlaceholder")}
                required
              />
            )}
          </FormField>
          <FormField name="phone" label={t("fields.phone")} state={state}>
            {(control) => <Input {...control} type="tel" placeholder="(83) 98765-4321" required />}
          </FormField>
          <FormField name="email" label={t("fields.email")} description={t("fields.optional")} state={state}>
            {(control) => <Input {...control} type="email" autoComplete="off" />}
          </FormField>
          <FormField name="address" label={t("fields.address")} description={t("fields.optional")} state={state}>
            {(control) => <Input {...control} autoComplete="off" />}
          </FormField>
          <div className="md:col-span-2">
            <FormField
              name="legalBasis"
              label={t("fields.legalBasis")}
              description={t("fields.legalBasisHint")}
              state={state}
            >
              {(control) => (
                <OptionSelect
                  key={state.values.legalBasis}
                  {...control}
                  options={legalBases}
                  placeholder={t("fields.legalBasisPlaceholder")}
                  required
                />
              )}
            </FormField>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" render={<Link href="/patients" />}>
            {t("form.cancel")}
          </Button>
          <SubmitButton pending={pending} label={submitLabel} pendingLabel={pendingLabel} />
        </div>
      </FieldGroup>
    </form>
  );
}
