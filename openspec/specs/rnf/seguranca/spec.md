# rnf/seguranca Specification

## Purpose
Requisitos não funcionais de proteção das credenciais dos usuários do CliniCore.

## Requirements

### Requirement: NF-SEG-01 — Senha nunca exibida nem armazenada em texto puro
O sistema NÃO DEVE exibir a senha em listagens, respostas ou mensagens de erro, e NÃO DEVE armazená-la em texto puro: apenas o hash derivado com scrypt e salt aleatório de 16 bytes é gravado.

**Prioridade:** Essencial
**Casos de uso:** UC05, UC06

#### Scenario: Usuário cadastrado
- **GIVEN** o Administrador cadastra um usuário com a senha "Secret@123"
- **WHEN** o registro gravado e a listagem de usuários são inspecionados
- **THEN** nenhum dos dois contém a senha; o registro gravado contém apenas o hash

#### Scenario: Erro de validação
- **WHEN** um cadastro é recusado por senha inválida
- **THEN** a mensagem de erro descreve a regra violada sem repetir a senha digitada

### Requirement: NF-SEG-02 — Autenticação e autorização por papel
O sistema DEVE exigir autenticação por login e senha para qualquer funcionalidade, exceto a tela de login, e DEVE liberar a cada usuário apenas as funcionalidades do seu papel (RBAC), seguindo o princípio do menor privilégio (NF02 do documento de requisitos).

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

### Requirement: NF-SEG-03 — Tráfego criptografado
Todo o tráfego entre o navegador e o sistema, e entre o sistema e serviços externos (banco de dados hospedado e sistemas FHIR), DEVE usar HTTPS com TLS 1.2 ou superior (NF03 do documento de requisitos).

**Prioridade:** Essencial
**Casos de uso:** UC04

#### Scenario: Acesso por HTTP
- **WHEN** um navegador acessa o sistema por `http://`
- **THEN** o sistema redireciona para o mesmo endereço em `https://` antes de exibir qualquer página

#### Scenario: Cliente com TLS antigo
- **WHEN** um cliente tenta se conectar oferecendo apenas TLS 1.1 ou inferior
- **THEN** a conexão é recusada
