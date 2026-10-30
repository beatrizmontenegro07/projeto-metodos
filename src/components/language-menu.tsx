"use client";

import { CheckIcon, LanguagesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type LanguageMenuProps = {
  label: string;
  currentLocale: string;
  options: { locale: string; label: string }[];
};

/** Each option links to /<locale>: the proxy stores the choice in the NEXT_LOCALE cookie. */
export function LanguageMenu({ label, currentLocale, options }: LanguageMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="sm" aria-label={label} />}>
        <LanguagesIcon />
        <span className="hidden sm:inline">{options.find(({ locale }) => locale === currentLocale)?.label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map(({ locale, label: optionLabel }) => (
          <DropdownMenuItem key={locale} render={<a href={`/${locale}`} lang={locale} />}>
            {optionLabel}
            {locale === currentLocale && <CheckIcon className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
