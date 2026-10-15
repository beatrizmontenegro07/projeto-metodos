# ADR-0006: Isolar a persistência de usuários atrás de um repositório

- **Status:** aceito
- **Data:** 2026-10-15
- **Requisitos relacionados:** NF-MAN-01, NF-CON-01, S1 e S2.3 ([cronograma](../../00-entregas.md))

## Contexto

O [ADR-0004](0004-nextjs-typescript-sqlite.md) trocava o mecanismo de persistência só pela `DATABASE_URL`: o modo RAM era o mesmo SQLite com o endereço `:memory:`, e o `UserController` usava o Drizzle diretamente. Na avaliação da Entrega 1, o professor apontou três problemas:

- não há coleção em RAM (Sprint 1): a "memória" é o mesmo banco;
- mudar a `DATABASE_URL` troca o arquivo do mesmo banco, não o mecanismo (Sprint 2);
- a regra de negócio depende da infraestrutura, sem interface (inversão de dependência).

## Decisão

A camada de negócio define a interface `UserRepository` (`src/modules/users/user-repository.ts`), com `add` e `list`. Há duas implementações em `src/infra/users/`:

| Mecanismo | Classe | Onde os dados ficam |
|---|---|---|
| `memory` | `InMemoryUserRepository` | Uma coleção em RAM; somem quando o processo termina |
| `sqlite` | `SqliteUserRepository` | Tabela `users` no SQLite (arquivo local ou Turso, pela `DATABASE_URL`) |

O mecanismo é escolhido uma única vez, na inicialização, pela variável `STORAGE`, em `createUserRepository` (`user-repository-factory.ts`). O `UserController` recebe a interface pelo construtor e não conhece nenhuma implementação. As duas implementações passam pelo mesmo conjunto de testes de contrato: mesmos códigos de erro para e-mail e login repetidos, mesma ordem de listagem, sem devolver o hash da senha. Falhas do banco viram `UserPersistenceError` dentro do `SqliteUserRepository`.

Este ADR retoma a decisão do [ADR-0003](0003-persistencia-substituivel.md) e substitui a parte de persistência do ADR-0004. O restante do ADR-0004 (Next.js, TypeScript, SQLite com Drizzle) continua valendo.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Manter só a `DATABASE_URL` (ADR-0004) | Não há coleção em RAM nem troca de mecanismo, e o controle depende do Drizzle |
| Repositório genérico para todas as entidades | Cada entidade tem regras de unicidade próprias; um repositório por entidade mantém a interface pequena |

## Consequências

- Positivas: a regra de negócio depende só da interface; os testes do controle rodam na coleção em RAM, sem banco; um novo mecanismo é uma nova classe, sem mudar o controle. Prepara o padrão Repository e a fábrica de repositórios exigidos na Sprint 4.
- Negativas / riscos: cada nova consulta precisa ser implementada nos dois mecanismos; os testes de contrato garantem que eles continuem iguais. O modo `memory` vale por processo, então não serve para a Vercel.
