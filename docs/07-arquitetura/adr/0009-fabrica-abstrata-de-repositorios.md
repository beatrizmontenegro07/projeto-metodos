# ADR-0009: Abstract Factory para a família de repositórios

- **Status:** aceito
- **Data:** 2026-11-11
- **Requisitos relacionados:** NF-MAN-01, NF-CON-01, S4.1, S4.2

## Contexto

Usuários e pacientes já possuem Repository: interfaces na camada business e implementações RAM e SQLite em infra. As funções independentes de seleção por entidade duplicavam a leitura de `STORAGE` e não caracterizavam uma Abstract Factory. As duas entidades precisam usar o mesmo mecanismo, pois cada paciente referencia seu autor em `users`.

## Decisão

Definir `RepositoryFactory` em `src/infra/repository-factory.ts`, com `createUserRepository` e `createPatientRepository`, retornando as interfaces de negócio. `InMemoryRepositoryFactory` cria as duas coleções RAM; `SqliteRepositoryFactory` recebe uma conexão e cria os dois repositórios SQLite sobre ela.

`createRepositoryFactory` seleciona a fábrica concreta. `getRepositories` lê e valida `STORAGE` uma vez e guarda a promessa da família em `globalThis`, compartilhando inclusive chamadas concorrentes e hot reloads. `getFacade` passa essa função à fachada existente. Business continua dependendo somente de `UserRepository` e `PatientRepository`, injetados nos controles.

Esta decisão substitui a seleção independente por entidade do ADR-0006. Não cria repositórios para entidades apenas planejadas na visão: as entidades persistidas atualmente são `User` e `Patient`; `Role`, `Gender` e `LegalBasis` são valores enumerados.

## Alternativas consideradas

- **Funções independentes com condicionais:** selecionam implementações, mas não representam uma família de produtos no padrão Abstract Factory.
- **Factory Method por entidade:** possível, mas mantém hierarquias de criação separadas para produtos que precisam compartilhar o mecanismo.
- **Repositório genérico:** reduz a especificidade dos contratos de cada entidade sem resolver a criação das famílias.

## Consequências

- A seleção do armazenamento e a montagem da família ficam centralizadas em infra; os contratos, regras e permissões de negócio permanecem iguais.
- SQLite compartilha uma conexão; RAM não precisa de `DATABASE_URL`. Uma nova entidade persistida exige um método no contrato da fábrica e implementação nas duas famílias.
- Os testes de contrato existentes verificam as implementações. Os testes da fábrica verificam seleção, conexão compartilhada, associação paciente–autor, configuração inválida e reutilização da família.
