# ADR-0004: Adotar Next.js, TypeScript e SQLite com Drizzle

- **Status:** proposto
- **Data:** 2026-10-14
- **Requisitos relacionados:** NF-MAN-01, NF-CON-03, S2.3 ([cronograma](../../00-entregas.md))

## Contexto

O código estava dividido entre uma API Node.js em CommonJS e uma SPA React/Vite separada, com persistência própria em arquivo binário (`v8.serialize`). Cada nova entidade repetia fábrica de repositório, serialização e tratamento de E/S, sem tipos, consultas nem garantia de unicidade. O deploy previsto é na Vercel, cujo sistema de arquivos não é permanente: um arquivo binário não sobrevive entre execuções lá.

A Sprint 2 (S2.3) exige escolher, na inicialização, entre armazenamento em RAM e permanente, tratando falhas de E/S.

## Decisão

O CliniCore passa a ser um único aplicativo **Next.js** (App Router) em **TypeScript**, com componentes **shadcn/ui**, e persiste os dados em **SQLite** por meio do **Drizzle ORM** e do cliente libSQL. O mecanismo é escolhido na inicialização pela variável `DATABASE_URL`:

| `DATABASE_URL` | Mecanismo | Uso |
|---|---|---|
| `:memory:` | RAM — os dados somem ao encerrar o processo | Testes e demonstração do modo volátil |
| `file:local.db` | SQLite em arquivo local | Desenvolvimento |
| `libsql://<banco>.turso.io` | Turso (SQLite hospedado) | Deploy na Vercel |

O esquema fica em `src/db/schema.ts` e as migrações versionadas em `drizzle/`. Esta decisão substitui o [ADR-0003](0003-persistencia-substituivel.md): não há interface de repositório nem uma implementação por mecanismo, porque a troca RAM × permanente é feita pela URL com o mesmo código. Falhas do banco continuam convertidas em exceção de negócio (`ErroDePersistenciaDeUsuarios`) pelo controle.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Manter API Express e SPA Vite separadas | Dois projetos e dois builds, com o contrato HTTP duplicado; o Next.js entrega interface e servidor no mesmo deploy da Vercel |
| Manter o arquivo binário próprio | Não funciona na Vercel; sem consultas nem unicidade; código de infraestrutura a manter por entidade |
| PostgreSQL | Exige um servidor de banco para desenvolver e testar; o SQLite roda em memória nos testes e em arquivo local sem instalação |
| Repositório em memória e repositório SQL atrás de uma interface (ADR-0003) | Duplica cada consulta; o SQLite em `:memory:` já atende ao modo RAM com o mesmo código |

## Consequências

- Positivas: um único código de acesso a dados para todos os modos; testes rodam em SQLite em memória, sem configuração; esquema e migrações versionados no repositório; tipos verificados da tabela até a tela.
- Negativas / riscos: os controles usam o Drizzle diretamente, então o padrão Repository exigido na Sprint 4 terá de ser introduzido sobre esta base. O banco em memória vale por processo: serve para testes e desenvolvimento, não para a Vercel. Bancos permanentes precisam de `npm run db:migrate` antes de cada deploy que altere o esquema.
