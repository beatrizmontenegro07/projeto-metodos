## ADDED Requirements

### Requirement: RF06 — Autenticar
O sistema DEVE permitir que um usuário cadastrado entre informando seu login ou seu e-mail (sem diferenciar maiúsculas de minúsculas no e-mail) e sua senha, mantendo a sessão por 8 horas ou até que ele saia, e DEVE recusar credenciais incorretas com a mesma mensagem, sem revelar se o login existe.

**Prioridade:** Essencial
**Casos de uso:** UC04

#### Scenario: Login com o login
- **GIVEN** a usuária "ana" está cadastrada com a senha "Secret@123"
- **WHEN** ela informa o login "ana" e a senha "Secret@123"
- **THEN** o sistema abre a sessão e exibe a página inicial com o nome "Ana Silva"

#### Scenario: Login com o e-mail
- **GIVEN** a usuária "ana" está cadastrada com o e-mail "ana@clinicore.com"
- **WHEN** ela informa "ANA@clinicore.com" e a senha correta
- **THEN** o sistema abre a sessão

#### Scenario: Senha incorreta
- **GIVEN** a usuária "ana" está cadastrada
- **WHEN** ela informa o login "ana" e a senha "Errada@123"
- **THEN** o sistema recusa o login informando "Login ou senha incorretos."

#### Scenario: Usuário inexistente
- **GIVEN** não existe usuário com o login "bia"
- **WHEN** alguém informa o login "bia" e qualquer senha
- **THEN** o sistema recusa o login informando "Login ou senha incorretos."

#### Scenario: Campos vazios
- **WHEN** alguém solicita entrar sem informar o login ou e-mail
- **THEN** o sistema recusa informando "Informe o login ou o e-mail."

#### Scenario: Sair
- **GIVEN** a usuária "ana" está com a sessão aberta
- **WHEN** ela escolhe "Sair"
- **THEN** a sessão é encerrada e o sistema exibe a tela de login

#### Scenario: Sessão expirada
- **GIVEN** a usuária "ana" entrou há mais de 8 horas
- **WHEN** ela abre qualquer página do sistema
- **THEN** o sistema exibe a tela de login

### Requirement: RF16 — Criar o primeiro Administrador
Enquanto não houver nenhum usuário cadastrado, o sistema DEVE permitir criar o primeiro usuário, obrigatoriamente com o papel Administrador e seguindo as regras de RF07, RF08 e RF09; depois disso, NÃO DEVE permitir essa criação, e novos usuários só são cadastrados pelo Administrador (RF07).

**Prioridade:** Essencial
**Casos de uso:** UC05

#### Scenario: Primeiro acesso
- **GIVEN** não há usuários cadastrados
- **WHEN** alguém abre a tela de login
- **THEN** o sistema leva à criação do primeiro Administrador

#### Scenario: Criação do primeiro Administrador
- **GIVEN** não há usuários cadastrados
- **WHEN** alguém cria "Carla Souza", e-mail "carla@clinicore.com", login "carla" e senha "Secret@123"
- **THEN** o usuário é cadastrado com o papel Administrador e a sessão dele é aberta

#### Scenario: Sistema já configurado
- **GIVEN** já existe um usuário cadastrado
- **WHEN** alguém tenta criar o primeiro Administrador
- **THEN** o sistema recusa informando "O primeiro administrador já foi criado. Entre com sua conta."
