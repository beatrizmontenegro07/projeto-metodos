import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Pages are rewritten to app/[locale]; API routes, Next internals, and static files are not.
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
