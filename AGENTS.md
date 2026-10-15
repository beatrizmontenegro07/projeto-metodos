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

- `src/app/[locale]/`: pages and layouts (ui layer). URLs carry no locale:
  `/patients` is rewritten internally to `[locale]/patients`.
- `src/app/api/`: route handlers.
- `src/components/ui/`: shadcn/ui components; add new ones with
  `npx shadcn@latest add <component>`.
- `src/modules/<capability>/`: business rules per capability (e.g. `users`):
  types, validation, domain errors, and controllers. Tests sit next to the
  code as `*.test.ts`.
- `src/infra/<capability>/`: storage implementations of the module's
  repository interface (e.g. `InMemoryUserRepository`, `SqliteUserRepository`)
  and the factory that picks one at startup.
- `src/db/`: Drizzle schema (`schema.ts`) and the database client (`index.ts`).
- `src/i18n/`: locales (`routing.ts`) and next-intl request config.
- `src/proxy.ts`: picks the locale (`NEXT_LOCALE` cookie, then browser
  language, then `pt-BR`) and rewrites page requests to it.
- `messages/`: translation catalogs; `en.json` is the source.
- `drizzle/`: generated SQL migrations, committed.
- `docs/relatorio/codigos/`: PlantUML sources; rendered images in
  `docs/relatorio/images/`.

Keep dependencies pointed inward: `src/app` calls `src/modules`; modules never
import from `src/app`, `src/infra`, `src/db`, or React. Each module defines a
repository interface (e.g. `UserRepository`); controllers receive it through
the constructor, and `src/infra` implements it.

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
- Domain validation raises one error class per field (e.g. `InvalidLoginError`)
  with one stable `code` per case (e.g. `LOGIN_TOO_LONG`, never a catch-all
  code); see `src/modules/users/errors.ts`. The UI shows the specific message
  from `<capability>.errors.<code>`. Do not use magic values or `null` to signal
  errors.
- Never expose or persist plaintext passwords. Store only `users.password_hash`
  (see `src/modules/users/password.ts`) and select public columns explicitly.
- Storage is selected once at startup through `STORAGE`: `memory` (a RAM
  collection) or `sqlite` (the database at `DATABASE_URL`: `file:local.db` or
  `libsql://...` for Turso). Every repository implementation must pass the
  shared contract tests (`*.contract.test.ts`); the SQLite one wraps database
  failures in the module's persistence error.
- Change the schema only in `src/db/schema.ts`, then run `npm run db:generate`.
  Never edit a migration that has already been applied.
- Route paths are English, lowercase, kebab-case, with plural resource names.
  Pages: `src/app/[locale]/patients/page.tsx` serves `/patients` in every
  locale; never put a locale in links or redirects. To switch language, link
  to `/<locale>` (e.g. `/en`): the proxy stores the choice in the cookie and
  redirects to `/`. API: `src/app/api/users/route.ts` serves `/api/users`,
  and auth lives under `/api/auth/*`.
- Read the locale from next-intl (`getLocale`, `getTranslations`), never from
  cookies or headers: pages must stay prerenderable under `cacheComponents`.
  API route handlers run outside `[locale]`: they use
  `resolveRequestLocale(request)` and answer failures as
  `{ error: { code, message } }` (see `src/app/api/users/users-handlers.ts`).
- Do not commit `*.db` files, `.env*` files other than `.env.sample`,
  credentials, or runtime artifacts.
## Course documentation

- `docs/00-entregas.md` belongs to the professor (do not edit it): it lists
  what each release must deliver. Check it when planning a sprint.
- Documentation stays in Portuguese; it refers to code by the English names
  mapped in ADR-0005 and in the glossary's "No código" column.
- When behavior changes, update in the same PR: the requirement in
  `openspec/specs/<capability>/spec.md` (ID, **Prioridade**, at least one
  GIVEN/WHEN/THEN scenario; IDs are never renumbered or reused), the use
  cases in `docs/04-casos-de-uso/`, the analysis diagram in
  `docs/05-analise.md`, and the design diagram in `docs/08-projeto.md`.
- Never invent elicitation records, participants, or findings: document only
  what the team actually did.

## Required verification

```bash
npm test        # Vitest; uses an in-memory SQLite database
npm run lint
npm run build   # also type-checks
OPENSPEC_TELEMETRY=0 npx @fission-ai/openspec@1 validate --all   # same check as CI
```

Render diagrams before declaring documentation done:

```bash
docker run --rm --user 0 -v "$PWD/docs/relatorio/codigos":/data plantuml/plantuml:latest \
-tpng /data/classes-de-analise.puml -o ../images
```

## Git and pull requests

- Work from `feat/`, `fix/`, `docs/`, or `refactor/` branches cut from
  `main`, and open pull requests against `main`. There is no `develop`
  branch. Never push to `main` directly.
- Use small Conventional Commit commits with a clear English message.
- Keep each PR reviewable: about 400 changed lines, not counting
  `package-lock.json` or generated files (migrations metadata, shadcn
  components). Split larger work into a stack of dependent PRs with
  [`gh stack`](https://github.com/github/gh-stack): one concern per layer,
  foundations (schema, domain rules) at the bottom, screens at the top, and
  each layer passing the required verification on its own.
- Agents run `gh stack` non-interactively: always pass branch names to
  `init`, `add`, and `checkout`, and use `gh stack submit --auto` and
  `gh stack view --json`.
- Merge stacked PRs bottom first on GitHub, then run `gh stack sync` to rebase
  the remaining layers onto `main`.
- Releases follow the dates in `docs/00-entregas.md`: tag the delivered
  commit on `main` as `vX.Y.Z` and push the tag. Urgent fixes use a regular
  `fix/` branch and PR against `main`.
- Before reporting a delivery, inspect the diff, run the required verification,
  and read back the remote pull request state.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
