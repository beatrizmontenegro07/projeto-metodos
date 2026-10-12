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

- `backend/src/domain/`: entities, enums, domain errors.
- `backend/src/application/`: use cases, validation, and ports.
- `backend/src/infra/`: persistence implementations (memory, binary file).
- `backend/src/api/`: application input/output, routes and HTTP adaptors.
- `backend/test/`: executable tests using `node --test` and Node's `assert`.
- `docs/relatorio/`: LaTeX report and PlantUML diagrams (`codigos/` and `images/`).

Keep dependencies pointed inward: adapters depend on application code, while
infrastructure implements interfaces defined by the application layer.

## Implementation rules

- Write a failing test before changing behavior, then run it again after the
  minimal implementation.
- Domain validation must raise clear exceptions; do not use magic values or
  `null` to signal errors.
- Never expose or persist plaintext passwords. For the current user flow, the
  password is only validated and is not part of the persisted `User` entity.
- Keep the `memory` and `file` storage modes. Storage is selected at startup
  through `--storage=memory` or `--storage=file`.
- Do not commit `users.bin`, `usuarios.bin`, `node_modules/`, credentials,
  or runtime artifacts.
- Update the analysis class diagram when responsibilities or relevant classes
  change.

## Required verification

Execute unit and integration tests from project root or backend:

```bash
npm test
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
