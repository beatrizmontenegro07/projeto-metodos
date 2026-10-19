## MODIFIED Requirements

### Requirement: NF-SEG-02 — Autenticação e autorização por papel
O sistema DEVE exigir autenticação por login e senha para qualquer funcionalidade, exceto a tela de login, e DEVE liberar a cada usuário apenas as funcionalidades do seu papel (RBAC), seguindo o princípio do menor privilégio (NF02 do documento de requisitos): o Administrador gerencia usuários e pacientes, o Recepcionista gerencia pacientes, e o Médico e o Paciente acessam apenas a página inicial.

**Prioridade:** Essencial
**Casos de uso:** UC04, UC05, UC06

#### Scenario: Acesso sem login
- **GIVEN** um visitante sem sessão ativa
- **WHEN** ele acessa diretamente o endereço da listagem de usuários
- **THEN** o sistema o redireciona para a tela de login, sem exibir nenhum dado

#### Scenario: Papel sem permissão
- **GIVEN** uma Recepcionista autenticada
- **WHEN** ela tenta abrir a listagem de usuários, permitida só ao Administrador
- **THEN** o sistema nega o acesso e não exibe nenhum usuário

#### Scenario: Menu conforme o papel
- **GIVEN** um Médico autenticado
- **WHEN** ele abre a página inicial
- **THEN** o menu não exibe "Usuários" nem "Pacientes"

#### Scenario: API sem sessão
- **WHEN** uma requisição sem sessão chega a `GET /api/users`
- **THEN** o sistema responde com o status 401 e o código `UNAUTHENTICATED`, sem nenhum usuário

#### Scenario: API sem permissão
- **GIVEN** uma Recepcionista autenticada
- **WHEN** ela envia `GET /api/users`
- **THEN** o sistema responde com o status 403 e o código `ACCESS_DENIED`, sem nenhum usuário
