import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder with the shape of a form while its data loads. */
export function FormSkeleton({ fields }: { fields: number }) {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <Skeleton className="mx-auto h-8 w-2/3" />
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
      <Skeleton className="h-9 w-full" />
    </div>
  );
}
