# usuarios Specification

## Purpose
Gerenciamento dos usuários do CliniCore (Administrador, Recepcionista, Médico e Paciente): cadastro com validação de login e senha e listagem dos usuários cadastrados.

## Requirements

### Requirement: RF07 — Cadastrar usuário
O sistema DEVE permitir que o Administrador cadastre usuários informando nome, e-mail, login, senha e papel (Administrador, Recepcionista, Médico ou Paciente), recusando e-mails e logins já cadastrados e informando o motivo de qualquer recusa.

**Prioridade:** Essencial
**Casos de uso:** UC05

#### Scenario: Cadastro válido
- **GIVEN** não existe usuário com o e-mail "ana@clinicore.com" nem com o login "ana"
- **WHEN** o Administrador cadastra "Ana Silva", e-mail "ana@clinicore.com", login "ana", senha "Secret@123" e papel Recepcionista
- **THEN** o usuário é armazenado com um identificador único e passa a aparecer na listagem

#### Scenario: E-mail já cadastrado
- **GIVEN** já existe um usuário com o e-mail "ana@clinicore.com"
- **WHEN** o Administrador tenta cadastrar outro usuário com o e-mail "ana@clinicore.com"
- **THEN** o sistema recusa o cadastro informando "Já existe um usuário cadastrado com este e-mail."

#### Scenario: Login já cadastrado
- **GIVEN** já existe um usuário com o login "ana"
- **WHEN** o Administrador tenta cadastrar outro usuário com o login "ana"
- **THEN** o sistema recusa o cadastro informando "Já existe um usuário cadastrado com este login."

#### Scenario: Papel inexistente
- **WHEN** o Administrador tenta cadastrar um usuário com o papel "Gerente"
- **THEN** o sistema recusa o cadastro informando "O papel do usuário é inválido."

### Requirement: RF08 — Regras de login
O sistema DEVE aceitar apenas logins não vazios, com no máximo 12 caracteres e sem números.

**Prioridade:** Essencial
**Casos de uso:** UC05

#### Scenario: Login vazio
- **WHEN** o Administrador tenta cadastrar um usuário com login vazio
- **THEN** o sistema recusa o cadastro informando "O login não pode ser vazio, ter números ou mais de 12 caracteres."

#### Scenario: Login com mais de 12 caracteres
- **WHEN** o Administrador informa o login "abcdefghijklm" (13 caracteres)
- **THEN** o sistema recusa o cadastro com a mesma mensagem

#### Scenario: Login com números
- **WHEN** o Administrador informa o login "ana1"
- **THEN** o sistema recusa o cadastro com a mesma mensagem

#### Scenario: Login com exatamente 12 caracteres
- **WHEN** o Administrador informa o login "abcdefghijkl" (12 caracteres)
- **THEN** o login é aceito

### Requirement: RF09 — Regras de senha
O sistema DEVE aceitar apenas senhas que sigam a política de senha padrão do AWS IAM: de 8 a 128 caracteres, com pelo menos 3 dos 4 tipos (minúscula, maiúscula, número, símbolo) e diferentes do login e do e-mail.

**Prioridade:** Essencial
**Casos de uso:** UC05

#### Scenario: Senha curta
- **WHEN** o Administrador informa a senha "Secret1" (7 caracteres)
- **THEN** o sistema recusa o cadastro informando "A senha deve ter de 8 a 128 caracteres e ser diferente do login e do e-mail."

#### Scenario: Senha longa
- **WHEN** o Administrador informa uma senha com 129 caracteres
- **THEN** o sistema recusa o cadastro com a mesma mensagem

#### Scenario: Senha igual ao login
- **WHEN** o Administrador informa o login "Strong@Pass" e a senha "Strong@Pass" (válida nas demais regras)
- **THEN** o sistema recusa o cadastro com a mesma mensagem

#### Scenario: Senha igual ao e-mail
- **WHEN** o Administrador informa o e-mail "Ana@clinicore.com1" e a mesma senha
- **THEN** o sistema recusa o cadastro com a mesma mensagem

#### Scenario: Senha com poucos tipos de caractere
- **WHEN** o Administrador informa a senha "ONLYLETTERS1" (maiúsculas e números)
- **THEN** o sistema recusa o cadastro informando "A senha deve conter pelo menos três tipos de caracteres: minúsculas, maiúsculas, números e símbolos."

#### Scenario: Senha com três tipos
- **WHEN** o Administrador informa a senha "Secret123" (maiúsculas, minúsculas e números)
- **THEN** a senha é aceita

### Requirement: RF10 — Listar usuários
O sistema DEVE permitir que o Administrador liste todos os usuários cadastrados em ordem de cadastro, exibindo identificador, nome, e-mail, login e papel, sem exibir a senha.

**Prioridade:** Essencial
**Casos de uso:** UC06

#### Scenario: Listagem com usuários
- **GIVEN** "Ana Silva" (Recepcionista) e "Dr. Bruno Lima" (Médico) foram cadastrados nessa ordem
- **WHEN** o Administrador solicita a listagem
- **THEN** o sistema exibe os dois usuários nessa ordem, com nome, e-mail, login e papel, sem a senha

#### Scenario: Nenhum usuário
- **GIVEN** não há usuários cadastrados
- **WHEN** o Administrador solicita a listagem
- **THEN** o sistema exibe uma listagem vazia
