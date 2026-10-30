"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/** A submit button that shows progress while the form's Server Action runs. */
export function SubmitButton({
  pending,
  label,
  pendingLabel,
  ...props
}: { pending: boolean; label: string; pendingLabel: string } & Omit<React.ComponentProps<typeof Button>, "type">) {
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending && <Spinner />}
      {pending ? pendingLabel : label}
    </Button>
  );
}
