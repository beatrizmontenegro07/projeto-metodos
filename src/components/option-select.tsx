"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type SelectOption = { value: string; label: string };

type OptionSelectProps = {
  id: string;
  name: string;
  options: SelectOption[];
  placeholder: string;
  defaultValue?: string;
  "aria-invalid"?: boolean;
  required?: boolean;
  className?: string;
};

/** A select that submits `value` under `name` in a form, showing the translated label. */
export function OptionSelect({ id, name, options, placeholder, defaultValue, required, className, ...props }: OptionSelectProps) {
  return (
    <Select name={name} items={options} defaultValue={defaultValue || null} required={required}>
      <SelectTrigger id={id} className={className ?? "w-full"} aria-invalid={props["aria-invalid"]}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
