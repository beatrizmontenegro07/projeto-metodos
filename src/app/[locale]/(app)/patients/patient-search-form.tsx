"use client";

import { SearchIcon } from "lucide-react";
import Form from "next/form";
import { useTranslations } from "next-intl";

import { OptionSelect, type SelectOption } from "@/components/option-select";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

type PatientSearchFormProps = {
  text: string;
  status: string;
  statuses: SelectOption[];
};

/** RF14: the search lives in the URL (?search=&status=), so the server filters and the result can be shared. */
export function PatientSearchForm({ text, status, statuses }: PatientSearchFormProps) {
  const t = useTranslations("patients.list");

  return (
    <Form action="/patients" className="flex flex-col gap-2 sm:flex-row" role="search">
      <InputGroup className="sm:max-w-sm">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput name="search" defaultValue={text} placeholder={t("searchPlaceholder")} aria-label={t("searchLabel")} />
      </InputGroup>
      <OptionSelect
        id="status"
        name="status"
        options={statuses}
        defaultValue={status}
        placeholder={t("statusLabel")}
        className="sm:w-48"
      />
      <Button type="submit" variant="secondary">
        {t("search")}
      </Button>
    </Form>
  );
}
