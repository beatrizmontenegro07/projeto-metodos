# ADR-0002: Garantir e-mail e login únicos com restrição no banco

- **Status:** aceito
- **Data:** 2026-10-14
- **Requisitos relacionados:** RF07, NF-CON-01

## Contexto

O RF07 exige recusar e-mails (sem diferenciar maiúsculas de minúsculas) e logins já cadastrados, inclusive quando dois cadastros chegam ao mesmo tempo (cenário "Cadastros simultâneos com o mesmo login"). Se a aplicação primeiro consulta se o valor já existe e só depois insere, há uma condição de corrida: as duas requisições podem passar pela consulta antes de qualquer uma inserir.

## Decisão

A unicidade é garantida por índices únicos nas colunas `users.email` e `users.login` (`src/db/schema.ts`). O `SqliteUserRepository` não faz consulta prévia: ele insere direto, e o banco recusa o valor repetido. No mecanismo em RAM (`InMemoryUserRepository`), a coleção é verificada antes de inserir; como verificação e inserção acontecem sem pausa entre elas, não há corrida. O e-mail é gravado em minúsculas (`normalizeEmail`), e por isso o índice também barra "ANA@Clinicore.com" quando "ana@clinicore.com" já existe.

A violação chega como "UNIQUE constraint failed: users.<coluna>". `findUniqueConstraintColumn` (`src/db/errors.ts`) identifica a coluna, e `SqliteUserRepository.accessStorage` a converte em `DuplicateUserError` com o código `EMAIL_ALREADY_REGISTERED` ou `LOGIN_ALREADY_REGISTERED`. Qualquer outra falha do banco vira `UserPersistenceError` (NF-CON-01).

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Consultar antes de inserir, só na aplicação | Condição de corrida: dois cadastros simultâneos com o mesmo login seriam aceitos |
| Lock ou fila na aplicação | Não protege quando a Vercel executa mais de uma instância; mais código de concorrência |
| Índice com `COLLATE NOCASE` no e-mail | Também funcionaria, mas gravar o e-mail já normalizado deixa a regra visível no código de negócio e vale igual para buscas e comparações |

## Consequências

- Positivas: a garantia vale sob concorrência e em qualquer número de instâncias, e o cadastro custa uma única ida ao banco.
- Negativas: a identificação da coluna depende do texto da mensagem de erro do SQLite. Esse comportamento é coberto pelos testes de cadastros simultâneos em `user-controller.test.ts`. A mesma estratégia deverá ser usada no CPF único do Paciente.
