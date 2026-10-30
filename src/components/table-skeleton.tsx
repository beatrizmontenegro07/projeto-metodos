import { Skeleton } from "@/components/ui/skeleton";

const PLACEHOLDER_ROWS = 4;

/** Placeholder with the shape of a table while its rows load. */
export function TableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4" aria-hidden>
      {Array.from({ length: PLACEHOLDER_ROWS + 1 }, (_, row) => (
        <div key={row} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }, (_, column) => (
            <Skeleton key={column} className={row === 0 ? "h-4 w-2/3" : "h-5"} />
          ))}
        </div>
      ))}
    </div>
  );
}
