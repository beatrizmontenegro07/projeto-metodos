import { Suspense } from "react";

import { CurrentUserSidebar } from "@/components/current-user-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * The signed-in shell. The sidebar reads the session, so it streams inside Suspense and the rest
 * of the shell stays prerendered; each page still checks the user itself.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Suspense fallback={<SidebarSkeleton />}>
        <CurrentUserSidebar />
      </Suspense>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

function SidebarSkeleton() {
  return (
    <div className="hidden w-(--sidebar-width) shrink-0 flex-col gap-4 border-r bg-sidebar p-4 md:flex" aria-hidden>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-6 w-2/3" />
    </div>
  );
}
