# Proposta: autenticação e controle de acesso por papel

## Why

As rotas de usuários (UC05, UC06) estão abertas: qualquer pessoa cadastra ou lista usuários, e as telas da Entrega 2 (pacientes) não podem ficar públicas. O RF06 e o NF-SEG-02 exigem login e acesso conforme o papel, e o cadastro de pacientes precisa saber qual usuário o fez.

## What Changes

- Login (UC04) com login **ou** e-mail e senha, verificando o hash scrypt já gravado; a mesma mensagem para usuário inexistente e senha errada.
- Sessão por cookie assinado, válida por 8 horas, e opção "Sair".
- Criação do primeiro Administrador enquanto não houver usuário cadastrado, para que o sistema possa ser usado logo após a instalação.
- Matriz de permissões por papel: o Administrador gerencia usuários e pacientes; o Recepcionista gerencia pacientes; Médico e Paciente veem só a página inicial.
- As rotas `/api/users` passam a exigir sessão de Administrador (401 sem sessão, 403 sem permissão).

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `usuarios`: novos requisitos RF06 (autenticar e sair) e RF16 (primeiro Administrador).
- `rnf/seguranca`: o NF-SEG-02 passa a listar o que cada papel acessa e o comportamento das rotas de API sem sessão ou sem permissão.

## Impact

- Código: `src/modules/auth/` (controle de autenticação, erros e permissões), consulta de credenciais e contagem no `UserRepository` e nas duas implementações, verificação de senha em `password.ts`, sessão em `src/infra/auth/`, telas `/login` e `/setup`.
- Dependência nova: `jose` (assinatura do cookie de sessão).
- Configuração: variável `SESSION_SECRET` (pelo menos 32 caracteres) no `.env.sample`.
- Decisão registrada no ADR-0008 (sessão sem estado em cookie assinado).

## Fora do escopo

- Recuperação de senha, troca de senha e edição ou desativação de usuários.
- Bloqueio por tentativas repetidas de login e autenticação em dois fatores.
- Login social e portal do Paciente.
- Redirecionamento de HTTP para HTTPS (NF-SEG-03), que fica a cargo da Vercel.
