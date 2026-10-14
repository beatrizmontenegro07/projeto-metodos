import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Every page lives under a locale prefix; API routes, Next internals, and static files do not.
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
