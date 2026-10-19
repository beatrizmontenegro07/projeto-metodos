# Design: autenticação e controle de acesso por papel

## Context

As senhas já são gravadas como hash scrypt (`<salt>:<chave>`, `src/modules/users/password.ts`). O `UserRepository` só tem `add` e `list`. As páginas rodam com `cacheComponents`, então ler o cookie de sessão torna o trecho dinâmico e exige `<Suspense>`. O proxy (`src/proxy.ts`) já reescreve as páginas para `app/[locale]`.

## Goals / Non-Goals

**Goals:**
- Um único lugar decide o que cada papel pode fazer, na camada de negócio, usado pelas telas e pelas rotas de API.
- A sessão funciona igual nos dois mecanismos de armazenamento (`memory` e `sqlite`).

**Non-Goals:**
- Sessões revogáveis no servidor (tabela de sessões); ver Riscos.

## Decisions

### Controle de autenticação na camada de negócio

`AuthenticationController.signIn({ identifier, password })` (`src/modules/auth/`) procura o usuário pelo login exato ou pelo e-mail normalizado (`UserRepository.findCredentials`), verifica a senha com `verifyPassword` (scrypt + `timingSafeEqual`) e devolve o `User`. Quando o usuário não existe, a senha é comparada com um hash fixo, para que o tempo de resposta não revele se o login existe. Cada falha tem sua classe e seu código: `InvalidSignInIdentifierError` (`SIGN_IN_IDENTIFIER_EMPTY`), `InvalidSignInPasswordError` (`SIGN_IN_PASSWORD_EMPTY`) e `IncorrectCredentialsError` (`CREDENTIALS_INCORRECT`).

### Permissões por papel

`src/modules/auth/permissions.ts` mapeia cada permissão para os papéis que a têm (`MANAGE_USERS` → Administrador; `MANAGE_PATIENTS` → Administrador e Recepcionista). A fachada da Entrega 2 recebe o usuário autenticado em cada operação e lança `AccessDeniedError` quando o papel não tem a permissão; as telas usam a mesma função `hasPermission` para montar o menu.

### Sessão sem estado em cookie assinado (ADR-0008)

O cookie `session` guarda um JWT HS256 assinado com `SESSION_SECRET` (biblioteca `jose`, recomendada pelo guia de autenticação do Next.js), com o id e o login do usuário e validade de 8 horas; é `httpOnly`, `sameSite=lax` e `secure` em produção. A cada requisição, `getCurrentUser` valida o token e busca o usuário pelo id no repositório: se ele não existir mais, ou se o login for outro (o modo `memory` reinicia os ids a cada execução), a sessão é tratada como encerrada.

| Alternativa | Por que não |
|---|---|
| Tabela de sessões no banco | Não existe no modo `memory` sem duplicar a lógica; o cookie assinado atende o requisito |
| Auth.js / NextAuth | Traz provedores e telas que o projeto não usa e esconde as regras que a disciplina pede para modelar |
| Guardar o papel no token | O papel ficaria desatualizado até o token expirar; buscar o usuário a cada requisição custa uma consulta por chave primária |

### Primeiro Administrador

`UserController.addFirstAdministrator` conta os usuários (`UserRepository.count`) e lança `FirstAdministratorExistsError` (`FIRST_ADMINISTRATOR_EXISTS`) se já houver algum; senão, cadastra com o papel Administrador pelas mesmas regras de RF07–RF09. A tela `/login` leva a `/setup` enquanto não houver usuários.

### Proteção das páginas e rotas

O proxy faz só a verificação otimista (cookie presente e válido) para redirecionar a `/login`; a verificação definitiva fica em cada página, Server Action e rota de API, como recomenda o guia do Next.js. As rotas de API respondem 401 (`UNAUTHENTICATED`) sem sessão e 403 (`ACCESS_DENIED`) sem permissão.

## Risks / Trade-offs

- [Sessão não revogável antes de expirar] → validade curta (8 horas) e consulta do usuário a cada requisição; a revogação entra quando houver desativação de usuários.
- [Corrida na criação do primeiro Administrador] → a janela é a de uma única instalação; no SQLite, o índice único de login e e-mail ainda impede duplicatas.
- [`SESSION_SECRET` ausente ou curto] → o sistema recusa abrir sessões e informa a variável que falta, como já faz com `STORAGE`.
