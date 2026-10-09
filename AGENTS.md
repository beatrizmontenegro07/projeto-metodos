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

- `src/main/java/br/ufpb/mps/domain/`: entities.
- `src/main/java/br/ufpb/mps/application/`: use cases, validation, and ports.
- `src/main/java/br/ufpb/mps/infra/`: persistence implementations.
- `src/main/java/br/ufpb/mps/interfaceadapters/`: application input/output.
- `src/test/java/`: executable tests using `assert`.
- `docs/diagrams/`: PlantUML sources and rendered images.

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
- Do not commit `users.bin`, `.class` files, `out/`, `sources.txt`, credentials,
  or runtime artifacts.
- Update the analysis class diagram when responsibilities or relevant classes
  change.

## Required verification

Use JDK 17 in a container; do not install local build dependencies:

```bash
docker run --rm -v "$PWD":/app -w /app eclipse-temurin:17-jdk sh -c \
'find src/main/java src/test/java -name "*.java" > /tmp/sources.txt && \
javac -Xlint:all -d /tmp/mps-out @/tmp/sources.txt && \
java -ea -cp /tmp/mps-out br.ufpb.mps.Sprint02Tests'
```

Render diagrams before declaring documentation done:

```bash
docker run --rm --user 0 -v "$PWD/docs/diagrams":/data plantuml/plantuml:latest \
-tpng /data/classes-de-analise.puml
```

## Git

- Work from `feat/`, `fix/`, `docs/`, or `refactor/` branches.
- Use small Conventional Commit commits with a clear English message.
- Open a pull request; do not push directly to `main`.
- Before reporting a delivery, inspect the diff, run the required verification,
  and read back the remote pull request state.
