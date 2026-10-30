# Tarefas: autenticação e controle de acesso por papel

## 1. Credenciais e contagem no repositório de usuários

- [ ] 1.1 Adicionar `findCredentials`, `findById` e `count` ao `UserRepository` e às duas implementações; verificar com os testes de contrato
- [ ] 1.2 Adicionar `verifyPassword` a `password.ts`; verificar com testes de senha correta, errada e hash malformado

## 2. Regras de autenticação e permissões

- [ ] 2.1 Criar `AuthenticationController.signIn` e os erros de login; verificar um teste por cenário de RF06
- [ ] 2.2 Criar `permissions.ts` com a matriz do NF-SEG-02; verificar com um teste por papel
- [ ] 2.3 Criar `UserController.addFirstAdministrator`; verificar os cenários de RF16

## 3. Sessão

- [ ] 3.1 Criar a sessão em cookie assinado (`src/infra/auth/`), `SESSION_SECRET` no `.env.sample` e o ADR-0008; verificar com testes de token válido, expirado e adulterado
- [ ] 3.2 Exigir sessão de Administrador em `/api/users`; verificar 401 e 403 nos testes das rotas

## 4. Telas

- [ ] 4.1 Criar as telas `/login` e `/setup` e o botão "Sair"; verificar manualmente os cenários de RF06 e RF16 nos dois idiomas
- [ ] 4.2 Montar o menu conforme o papel; verificar o cenário "Menu conforme o papel"

## Workflow follow-up

- Arquivar a change com `openspec archive autenticacao` depois do merge das tarefas.
