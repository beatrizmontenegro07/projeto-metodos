# ADR-0008: Manter a sessão num cookie assinado, sem estado no servidor

- **Status:** aceito
- **Data:** 2026-10-19
- **Requisitos relacionados:** RF06, NF-SEG-01, NF-SEG-02, NF-MAN-01

## Contexto

O login (UC04) precisa manter o usuário autenticado entre as páginas, as Server Actions e as rotas de API, e cada requisição precisa saber o papel do usuário para aplicar o NF-SEG-02. A sessão tem de funcionar igual nos dois mecanismos de armazenamento (`STORAGE=memory` e `STORAGE=sqlite`, [ADR-0006](0006-repositorio-de-usuarios.md)) e na Vercel, onde várias instâncias do servidor podem atender o mesmo usuário.

## Decisão

Guardar a sessão num cookie `session` com um JWT HS256 assinado pela variável `SESSION_SECRET` (pelo menos 32 caracteres), usando a biblioteca `jose`, como no guia de autenticação do Next.js:

- o token guarda só o id e o login do usuário e vale 8 horas (`src/infra/auth/session-token.ts`);
- o cookie é `httpOnly`, `sameSite=lax`, `path=/` e `secure` em produção (`src/infra/auth/session.ts`);
- a cada requisição, `findSessionUser` valida a assinatura e a validade e busca o usuário pelo id na fachada; se ele não existir mais ou se o login for outro, a sessão é tratada como inexistente. Assim o papel vem sempre do armazenamento, e um token do modo `memory` não aponta para outra pessoa depois de um reinício, quando os ids recomeçam;
- o proxy faz só a verificação otimista da assinatura para redirecionar a `/login`; a decisão de acesso fica na fachada ([ADR-0007](0007-fachada-unica.md)).

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Tabela de sessões no banco | Não existe no modo `memory` sem uma segunda implementação; o cookie assinado atende o RF06 |
| Auth.js (NextAuth) | Traz provedores e telas que o projeto não usa e esconde as regras que a disciplina pede para modelar |
| Guardar o papel no token | O papel ficaria desatualizado até o token expirar |
| Cookie com o id do usuário sem assinatura | Qualquer pessoa trocaria o id e entraria como outro usuário |

## Consequências

- Positivas: nenhuma tabela nova; funciona com vários servidores; o papel e a existência do usuário são conferidos a cada requisição.
- Negativas / riscos: a sessão não pode ser revogada antes de expirar, a não ser trocando o `SESSION_SECRET` (o que encerra todas as sessões); quando houver desativação de usuários, a consulta a cada requisição já impede o acesso de um usuário removido. Cada requisição autenticada faz uma consulta por chave primária.
