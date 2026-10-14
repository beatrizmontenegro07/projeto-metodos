# Project Methods — Agent Context

## Activity specifications

Do not keep sprint-specific instructions in this file: they change for every
assignment. Before changing code, retrieve the current specification through
the `sigaa` MCP server and read the relevant assignment body, course topics,
and materials. The MCP client and documentation live at
[`PucaVaz/sigaa-tools`](https://github.com/PucaVaz/sigaa-tools).

Minimum workflow:

1. Run `sigaa_sync`.
2. Find the assignment with `sigaa_list_deadlines`.
3. Read `sigaa_get_tarefa_body` and related materials/topics.
4. Confirm the resulting scope against this repository before implementing it.

## Structure and architecture

Single Next.js (App Router) + TypeScript app, SQLite through Drizzle ORM, UI
text through next-intl. See `docs/07-arquitetura/adr/0004-nextjs-typescript-sqlite.md`
and `docs/07-arquitetura/adr/0005-ingles-no-codigo-e-i18n.md`.

- `src/app/[locale]/`: pages and layouts (ui layer); every page URL starts
  with a locale (`/pt-BR/...`, `/en/...`).
- `src/app/api/`: route handlers; no locale prefix.
- `src/components/ui/`: shadcn/ui components; add new ones with
  `npx shadcn@latest add <component>`.
- `src/modules/<capability>/`: business rules per capability (e.g. `users`):
  types, validation, domain errors, and controllers. Tests sit next to the
  code as `*.test.ts`.
- `src/db/`: Drizzle schema (`schema.ts`) and the database client (`index.ts`).
- `src/i18n/`: locales (`routing.ts`) and next-intl request config.
- `src/proxy.ts`: redirects unprefixed page URLs to a locale.
- `messages/`: translation catalogs; `en.json` is the source.
- `drizzle/`: generated SQL migrations, committed.
- `docs/relatorio/codigos/`: PlantUML sources; rendered images in
  `docs/relatorio/images/`.

Keep dependencies pointed inward: `src/app` calls `src/modules`; modules never
import from `src/app` or React. Controllers receive the `Database` as a
constructor argument so tests can pass an in-memory one.

## Implementation rules

- Write a failing test before changing behavior, then run it again after the
  minimal implementation.
- Everything in the codebase is English: file and folder names, identifiers,
  database tables and columns, enum values, routes, and test names.
  Portuguese reaches users only through `messages/pt-BR.json`.
- Never hardcode user-facing text. Add the key to `messages/en.json` and every
  other catalog (`npm test` fails if they diverge), then use
  `getTranslations` (Server Components) or `useTranslations` (Client
  Components).
- Domain validation must raise typed errors with a stable `code` (see
  `src/modules/users/errors.ts`); the UI translates the code from
  `<capability>.errors.<code>`. Do not use magic values or `null` to signal
  errors.
- Never expose or persist plaintext passwords. Store only `users.password_hash`
  (see `src/modules/users/password.ts`) and select public columns explicitly.
- Storage is selected at startup through `DATABASE_URL`: `:memory:` (RAM),
  `file:local.db` (local SQLite), or `libsql://...` (Turso). Do not add
  per-mechanism repositories; wrap database failures in the module's
  persistence error.
- Change the schema only in `src/db/schema.ts`, then run `npm run db:generate`.
  Never edit a migration that has already been applied.
- Route paths are English, lowercase, kebab-case, with plural resource names.
  Pages: `src/app/[locale]/patients/page.tsx` serves `/pt-BR/patients` and
  `/en/patients`. API: `src/app/api/users/route.ts` serves `/api/users`, and
  auth lives under `/api/auth/*`.
- Read the locale from next-intl (`getLocale`, `getTranslations`), never from
  cookies or headers: pages must stay prerenderable under `cacheComponents`.
- Do not commit `*.db` files, `.env*` files other than `.env.sample`,
  credentials, or runtime artifacts.
- Update the analysis class diagram when responsibilities or relevant classes
  change.

## Required verification

```bash
npm test        # Vitest; uses an in-memory SQLite database
npm run lint
npm run build   # also type-checks
```

Render diagrams before declaring documentation done:

```bash
docker run --rm --user 0 -v "$PWD/docs/relatorio/codigos":/data plantuml/plantuml:latest \
-tpng /data/classes-de-analise.puml -o ../images
```

## Git

- Work from `feat/`, `fix/`, `docs/`, or `refactor/` branches.
- Use small Conventional Commit commits with a clear English message.
- Open a pull request; do not push directly to `main`.
- Before reporting a delivery, inspect the diff, run the required verification,
  and read back the remote pull request state.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
