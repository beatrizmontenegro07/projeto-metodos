# Projeto detalhado — pacotes, classes de projeto e padrões

> Não existia no modelo .docx. Aqui fica o **diagrama de classes de projeto**, que evolui a cada sprint, diferente do diagrama de **análise** (`05-analise.md`), que é conceitual e muda pouco.
> Atualize este arquivo em **toda** sprint (ver [cronograma](00-entregas.md)). Os nomes de classes são os do código, em inglês ([ADR-0005](07-arquitetura/adr/0005-ingles-no-codigo-e-i18n.md)).

## 1. Divisão de pacotes

As camadas da disciplina (**ui**, **business** e **infra**) correspondem às pastas do aplicativo Next.js:

```text
src/
├── app/                ← ui: páginas em app/[locale]/ e rotas de API em app/api/
│   └── api/users/
│       ├── route.ts            ← fronteira: GET e POST /api/users
│       └── users-handlers.ts   ← requisição → UserController; erro → resposta com código e mensagem
├── components/ui/      ← ui: componentes shadcn/ui
├── modules/            ← business: uma pasta por capacidade
│   └── users/
│       ├── user.ts             ← entidade: User, NewUser
│       ├── role.ts             ← enumeração: Role
│       ├── rules.ts            ← validação de login, senha e papel
│       ├── password.ts         ← hash da senha
│       ├── errors.ts           ← exceções: InvalidLoginError, InvalidPasswordError, InvalidRoleError, DuplicateUserError, UserPersistenceError
│       ├── user-repository.ts  ← interface: UserRepository
│       └── user-controller.ts  ← controle: UserController
├── infra/              ← infra: implementações das interfaces de repositório
│   └── users/
│       ├── in-memory-user-repository.ts  ← mecanismo 1: coleção em RAM
│       ├── sqlite-user-repository.ts     ← mecanismo 2: banco SQLite
│       └── user-repository-factory.ts    ← escolhe o mecanismo pela variável STORAGE
├── db/                 ← infra: esquema Drizzle (schema.ts), conexão (index.ts) e erros do banco (errors.ts)
└── i18n/               ← ui: idiomas e textos traduzidos (messages/)
```

**Regra de dependência:** `ui` → `business` ← `infra`. A camada `business` não importa nada de `ui` nem de `infra`: o `UserController` recebe a interface `UserRepository` pelo construtor, e `infra` a implementa ([ADR-0006](07-arquitetura/adr/0006-repositorio-de-usuarios.md)). A rota `/api/users` é o ponto de montagem: pega o repositório da fábrica (`getUserRepository`) e o entrega ao `UserController`.

## 2. Diagrama de classes de projeto

### Estado atual: Sprints 1 e 2

```mermaid
classDiagram
    direction LR

    namespace ui {
        class usersRoute {
            <<route /api/users>>
            +GET(request) Response
            +POST(request) Response
        }
        class usersHandlers {
            <<module>>
            +createUsersHandlers(getController) UsersHandlers
            -failureResponse(request, error) Response
        }
    }
    namespace business {
        class User {
            +number id
            +string name
            +string email
            +string login
            +Role role
        }
        class NewUser {
            +string name
            +string email
            +string login
            +string password
            +Role role
        }
        class Role {
            <<enumeration>>
            ADMIN
            RECEPTIONIST
            DOCTOR
            PATIENT
        }
        class UserController {
            -UserRepository repository
            +add(newUser: NewUser) Promise~User~
            +list() Promise~User[]~
        }
        class UserRepository {
            <<interface>>
            +add(record: NewUserRecord) Promise~User~
            +list() Promise~User[]~
        }
        class NewUserRecord {
            +string name
            +string email
            +string login
            +string passwordHash
            +Role role
        }
        class rules {
            <<module>>
            +normalizeEmail(email) string
            +validateRole(role) void
            +validateLogin(login) void
            +validatePassword(password, login, email) void
        }
        class password {
            <<module>>
            +hashPassword(password) Promise~string~
        }
        class UserValidationError {
            <<abstract exception>>
            +UserValidationErrorCode code
        }
        class InvalidLoginError {
            <<exception>>
            LOGIN_EMPTY
            LOGIN_TOO_LONG
            LOGIN_HAS_NUMBERS
        }
        class InvalidPasswordError {
            <<exception>>
            PASSWORD_TOO_SHORT
            PASSWORD_TOO_LONG
            PASSWORD_EQUALS_LOGIN
            PASSWORD_EQUALS_EMAIL
            PASSWORD_TOO_FEW_CHARACTER_TYPES
        }
        class InvalidRoleError {
            <<exception>>
            INVALID_ROLE
        }
        class DuplicateUserError {
            <<exception>>
            EMAIL_ALREADY_REGISTERED
            LOGIN_ALREADY_REGISTERED
        }
        class UserPersistenceError {
            <<exception>>
        }
    }
    namespace infra {
        class InMemoryUserRepository {
            -StoredUser[] storedUsers
            -number nextId
            +add(record: NewUserRecord) Promise~User~
            +list() Promise~User[]~
        }
        class SqliteUserRepository {
            -Database database
            +add(record: NewUserRecord) Promise~User~
            +list() Promise~User[]~
            -accessStorage(operation) T
        }
        class userRepositoryFactory {
            <<module>>
            +readStorageMechanism(value) StorageMechanism
            +createUserRepository(mechanism) Promise~UserRepository~
            +getUserRepository() Promise~UserRepository~
        }
        class StorageMechanism {
            <<enumeration>>
            memory
            sqlite
        }
        class db {
            <<module>>
            +createDatabase(url, authToken) Promise~Database~
            +getDatabase() Promise~Database~
            +applyMigrations(database) void
        }
        class Database {
            <<libSQL>>
        }
        class dbErrors {
            <<module>>
            +findUniqueConstraintColumn(error) string
        }
        class users {
            <<table>>
            id integer PK
            name text
            email text unique
            login text unique
            password_hash text
            role text
        }
    }

    usersRoute ..> usersHandlers : usa
    usersRoute ..> userRepositoryFactory : getUserRepository
    usersHandlers --> UserController
    UserController --> UserRepository
    UserController ..> NewUser : recebe
    UserController ..> rules : valida com
    UserController ..> password : gera hash com
    UserRepository ..> NewUserRecord : recebe
    UserRepository ..> User : retorna
    User --> Role
    UserValidationError <|-- InvalidLoginError
    UserValidationError <|-- InvalidPasswordError
    UserValidationError <|-- InvalidRoleError
    UserValidationError <|-- DuplicateUserError
    rules ..> InvalidLoginError : lança
    rules ..> InvalidPasswordError : lança
    rules ..> InvalidRoleError : lança
    UserRepository <|.. InMemoryUserRepository
    UserRepository <|.. SqliteUserRepository
    InMemoryUserRepository ..> DuplicateUserError : lança
    SqliteUserRepository ..> DuplicateUserError : lança
    SqliteUserRepository ..> UserPersistenceError : converte falhas do banco
    SqliteUserRepository --> Database
    SqliteUserRepository ..> dbErrors : identifica e-mail ou login repetido
    userRepositoryFactory --> StorageMechanism
    userRepositoryFactory ..> InMemoryUserRepository : cria se memory
    userRepositoryFactory ..> SqliteUserRepository : cria se sqlite
    db ..> Database : cria
    Database ..> users : lê e grava
```

### Os dois mecanismos de persistência

O `UserController` depende só da interface `UserRepository`. A fábrica escolhe a implementação uma única vez, na inicialização, pela variável `STORAGE` (NF-MAN-01, [ADR-0006](07-arquitetura/adr/0006-repositorio-de-usuarios.md)):

| `STORAGE` | Implementação | Comportamento |
|---|---|---|
| `memory` | `InMemoryUserRepository` | Coleção em RAM; os dados somem quando o processo termina |
| `sqlite` | `SqliteUserRepository` | Tabela `users` no banco da `DATABASE_URL` (arquivo local ou Turso); os dados sobrevivem ao reinício |

As duas implementações passam pelos mesmos testes de contrato (`user-repository.contract.test.ts`): mesmos códigos para e-mail e login repetidos, mesma ordem de listagem e nenhum hash de senha devolvido. Falhas do banco (arquivo inacessível, banco fora do ar, tabelas ausentes) são capturadas em `SqliteUserRepository.accessStorage` e convertidas em `UserPersistenceError` (NF-CON-01). No SQLite, e-mail e login repetidos são barrados pelos índices únicos da tabela `users`, inclusive em cadastros simultâneos. O e-mail é gravado em minúsculas (`normalizeEmail`). As regras lançam uma exceção por campo (`InvalidLoginError`, `InvalidPasswordError`, `InvalidRoleError`) e os repositórios lançam `DuplicateUserError`, todas subclasses de `UserValidationError`. Cada caso tem um código próprio (ex.: `LOGIN_TOO_LONG`, `PASSWORD_EQUALS_EMAIL`), e a interface mostra a mensagem específica desse código no idioma do usuário (`messages/pt-BR.json`, `users.errors.<código>`).

## 3. Padrões de projeto utilizados

Preencha uma linha por padrão aplicado. Cada padrão relevante também tem um ADR.

| Padrão | Sprint | Classes participantes (papel no padrão) | Problema que resolve no projeto | ADR |
|---|---|---|---|---|
| Singleton | S3 | | | |
| Facade | S3 | | | |
| Repository | S4 | | | |
| Factory Method / Abstract Factory | S4 | | | |
| Adapter | S4 | | | |
| Template Method | S4 | | | |
| Command | S5 | | | |
| Memento | S5 | | | |
