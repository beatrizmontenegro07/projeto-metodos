# Projeto detalhado — pacotes, classes de projeto e padrões

> Não existia no modelo .docx. Aqui fica o **diagrama de classes de projeto**, que evolui a cada sprint, diferente do diagrama de **análise** (`05-analise.md`), que é conceitual e muda pouco.
> Atualize este arquivo em **toda** sprint (ver [cronograma](00-entregas.md)). Os nomes de classes são os do código, em inglês ([ADR-0005](07-arquitetura/adr/0005-ingles-no-codigo-e-i18n.md)).

## 1. Divisão de pacotes

As camadas da disciplina (**ui**, **business** e **infra**) correspondem às pastas do aplicativo Next.js:

```text
src/
├── app/                         ← ui
│   ├── [locale]/
│   │   ├── (auth)/              ← telas sem sessão: /login (TL05) e /setup (TL06), com as Server Actions signIn e createFirstAdministrator
│   │   ├── (app)/               ← telas com sessão: início (TL07), patients (TL03, TL04) e users (TL01, TL02), com suas Server Actions
│   │   └── form-failures.ts     ← erro de domínio → campo e código mostrados no formulário
│   └── api/
│       ├── api-responses.ts     ← sessão, permissão e falhas comuns → { error: { code, message } }
│       ├── auth/                ← POST/DELETE /api/auth/session e POST /api/auth/first-administrator
│       ├── users/               ← GET e POST /api/users
│       └── patients/            ← /api/patients e /api/patients/[id]
├── components/                  ← ui: blocos de tela (menu lateral, cabeçalho, campos) e ui/ (shadcn/ui)
├── modules/                     ← business: uma pasta por capacidade
│   ├── facade/                  ← FacadeSingletonController e o tipo Repositories
│   ├── auth/                    ← AuthenticationController, permissões por papel e erros de login
│   ├── users/                   ← User, Role, regras, senha, erros, UserRepository e UserController
│   └── patients/                ← Patient, Gender, LegalBasis, regras, erros, PatientRepository e PatientController
├── infra/                       ← infra
│   ├── facade.ts                ← getFacade(): monta a fachada com os repositórios escolhidos por STORAGE
│   ├── storage-mechanism.ts     ← lê a variável STORAGE (memory ou sqlite)
│   ├── auth/                    ← sessão: token assinado (session-token.ts) e cookie (session.ts)
│   ├── users/                   ← InMemoryUserRepository, SqliteUserRepository e a fábrica
│   └── patients/                ← InMemoryPatientRepository, SqlitePatientRepository e a fábrica
├── db/                          ← infra: esquema Drizzle (users, patients), conexão e erros do banco
├── i18n/                        ← ui: idiomas e textos traduzidos (messages/)
└── proxy.ts                     ← escolhe o idioma e manda para /login quem não tem sessão
```

**Regra de dependência:** `ui` → `business` ← `infra`. A camada `business` não importa nada de `ui` nem de `infra`: cada controle recebe a interface do seu repositório, e a fachada recebe os repositórios pela função passada a `getInstance` ([ADR-0006](07-arquitetura/adr/0006-repositorio-de-usuarios.md), [ADR-0007](07-arquitetura/adr/0007-fachada-unica.md)). Telas, Server Actions e rotas de API chamam só a fachada, por `getFacade()`.

## 2. Diagrama de classes de projeto

### Estado atual: Sprint 3

O diagrama está dividido em três partes: a visão geral com a fachada, o módulo de usuários com a autenticação e o módulo de pacientes. Uma classe que aparece em mais de uma parte é a mesma.

#### 2.1 Visão geral: fronteiras, fachada e repositórios

```mermaid
classDiagram
    direction LR

    namespace ui {
        class pages {
            <<Server Components e Server Actions>>
            login, setup, início, users, patients
        }
        class apiRoutes {
            <<route handlers>>
            api users, api patients, api auth
        }
        class session {
            <<module>>
            +getCurrentUser() Promise~User~
            +requireUser() Promise~User~
            +getRequestUser(request) Promise~User~
            +startSession(user) void
            +endSession() void
        }
    }
    namespace business {
        class FacadeSingletonController {
            <<Facade, Singleton>>
            -Promise~FacadeSingletonController~ instance$
            -UserController users
            -AuthenticationController authentication
            -PatientController patients
            -FacadeSingletonController(repositories)
            +getInstance(loadRepositories) Promise~FacadeSingletonController~$
            +signIn(credentials) Promise~User~
            +findUser(id) Promise~User~
            +hasUsers() Promise~boolean~
            +createFirstAdministrator(newUser) Promise~User~
            +addUser(actor, newUser) Promise~User~
            +listUsers(actor) Promise~User[]~
            +addPatient(actor, input) Promise~Patient~
            +updatePatient(actor, id, input) Promise~Patient~
            +deactivatePatient(actor, id) Promise~Patient~
            +reactivatePatient(actor, id) Promise~Patient~
            +getPatient(actor, id) Promise~Patient~
            +searchPatients(actor, search) Promise~Patient[]~
            +countRegisteredEntities(actor) Promise~RegisteredEntityCounts~
            -authorize(actor, permission) void
        }
        class Repositories {
            <<type>>
            +UserRepository users
            +PatientRepository patients
        }
        class RegisteredEntityCounts {
            <<type>>
            +number users
            +number patients
        }
        class permissions {
            <<module>>
            +hasPermission(role, permission) boolean
        }
        class Permission {
            <<enumeration>>
            MANAGE_USERS
            MANAGE_PATIENTS
        }
        class AccessDeniedError {
            <<exception>>
            ACCESS_DENIED
        }
        class UserController
        class AuthenticationController
        class PatientController
        class UserRepository {
            <<interface>>
        }
        class PatientRepository {
            <<interface>>
        }
    }
    namespace infra {
        class facade {
            <<module>>
            +getFacade() Promise~FacadeSingletonController~
        }
        class storageMechanism {
            <<module>>
            +readStorageMechanism(value) StorageMechanism
        }
        class InMemoryUserRepository
        class SqliteUserRepository
        class InMemoryPatientRepository
        class SqlitePatientRepository
    }

    pages ..> facade : getFacade
    apiRoutes ..> facade : getFacade
    pages ..> session : usuário da sessão
    apiRoutes ..> session : usuário da requisição
    session ..> facade : findUser
    facade ..> FacadeSingletonController : getInstance
    facade ..> storageMechanism : STORAGE
    FacadeSingletonController ..> Repositories : recebe
    FacadeSingletonController --> UserController
    FacadeSingletonController --> AuthenticationController
    FacadeSingletonController --> PatientController
    FacadeSingletonController ..> permissions : verifica o papel
    FacadeSingletonController ..> AccessDeniedError : lança
    FacadeSingletonController ..> RegisteredEntityCounts : retorna
    permissions --> Permission
    UserController --> UserRepository
    AuthenticationController --> UserRepository
    PatientController --> PatientRepository
    UserRepository <|.. InMemoryUserRepository
    UserRepository <|.. SqliteUserRepository
    PatientRepository <|.. InMemoryPatientRepository
    PatientRepository <|.. SqlitePatientRepository
```

#### 2.2 Usuários e autenticação

```mermaid
classDiagram
    direction LR

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
            +addFirstAdministrator(newUser) Promise~User~
            +hasUsers() Promise~boolean~
            +list() Promise~User[]~
            +findById(id) Promise~User~
            +count() Promise~number~
        }
        class AuthenticationController {
            -UserRepository repository
            +signIn(credentials: SignInCredentials) Promise~User~
        }
        class UserRepository {
            <<interface>>
            +add(record: NewUserRecord) Promise~User~
            +list() Promise~User[]~
            +findById(id) Promise~User~
            +findCredentials(lookup) Promise~UserCredentials~
            +count() Promise~number~
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
            +verifyPassword(password, hash) Promise~boolean~
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
        class FirstAdministratorExistsError {
            <<exception>>
            FIRST_ADMINISTRATOR_EXISTS
        }
        class SignInError {
            <<abstract exception>>
            +SignInErrorCode code
        }
        class InvalidSignInIdentifierError {
            <<exception>>
            SIGN_IN_IDENTIFIER_EMPTY
        }
        class InvalidSignInPasswordError {
            <<exception>>
            SIGN_IN_PASSWORD_EMPTY
        }
        class IncorrectCredentialsError {
            <<exception>>
            CREDENTIALS_INCORRECT
        }
        class UserPersistenceError {
            <<exception>>
        }
    }
    namespace infra {
        class InMemoryUserRepository {
            -StoredUser[] storedUsers
            -number nextId
        }
        class SqliteUserRepository {
            -Database database
            -accessStorage(operation) T
        }
        class userRepositoryFactory {
            <<module>>
            +createUserRepository(mechanism) Promise~UserRepository~
            +getUserRepository() Promise~UserRepository~
        }
        class sessionToken {
            <<module>>
            +createSessionToken(claims, secret) Promise~SessionToken~
            +readSessionToken(token, secret) Promise~SessionClaims~
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

    UserController --> UserRepository
    UserController ..> NewUser : recebe
    UserController ..> rules : valida com
    UserController ..> password : gera hash com
    UserController ..> FirstAdministratorExistsError : lança
    AuthenticationController --> UserRepository
    AuthenticationController ..> password : verifica com
    AuthenticationController ..> SignInError : lança
    UserRepository ..> User : retorna
    User --> Role
    UserValidationError <|-- InvalidLoginError
    UserValidationError <|-- InvalidPasswordError
    UserValidationError <|-- InvalidRoleError
    UserValidationError <|-- DuplicateUserError
    SignInError <|-- InvalidSignInIdentifierError
    SignInError <|-- InvalidSignInPasswordError
    SignInError <|-- IncorrectCredentialsError
    UserRepository <|.. InMemoryUserRepository
    UserRepository <|.. SqliteUserRepository
    SqliteUserRepository ..> UserPersistenceError : converte falhas do banco
    SqliteUserRepository ..> users : lê e grava
    userRepositoryFactory ..> InMemoryUserRepository : cria se memory
    userRepositoryFactory ..> SqliteUserRepository : cria se sqlite
```

O login (RF06) procura o usuário pelo login exato ou pelo e-mail normalizado (`findCredentials`) e compara a senha com o hash em tempo constante (`verifyPassword`). Login inexistente e senha errada dão o mesmo erro, `IncorrectCredentialsError`, e um login inexistente também passa pelo scrypt, para que o tempo de resposta não revele quem está cadastrado. A sessão é um JWT assinado num cookie `httpOnly`, com o id e o login do usuário e validade de 8 horas; a cada requisição o usuário é lido de novo pela fachada ([ADR-0008](07-arquitetura/adr/0008-sessao-em-cookie-assinado.md)).

#### 2.3 Pacientes

```mermaid
classDiagram
    direction LR

    namespace business {
        class Patient {
            +number id
            +string name
            +string cpf
            +string birthDate
            +Gender gender
            +string phone
            +string email
            +string address
            +LegalBasis legalBasis
            +boolean active
            +number createdBy
        }
        class PatientInput {
            <<type>>
            textos digitados no formulário
        }
        class PatientSearch {
            <<type>>
            +string text
            +PatientStatusFilter status
        }
        class Gender {
            <<enumeration>>
            MALE
            FEMALE
            OTHER
            UNKNOWN
        }
        class LegalBasis {
            <<enumeration>>
            CONSENT
            HEALTH_PROTECTION
            LEGAL_OBLIGATION
            LIFE_PROTECTION
        }
        class PatientController {
            -PatientRepository repository
            -now() Date
            +add(input, createdBy) Promise~Patient~
            +update(id, input) Promise~Patient~
            +deactivate(id) Promise~Patient~
            +reactivate(id) Promise~Patient~
            +get(id) Promise~Patient~
            +search(search: PatientSearch) Promise~Patient[]~
            +count() Promise~number~
        }
        class PatientRepository {
            <<interface>>
            +add(record: NewPatientRecord) Promise~Patient~
            +update(id, data: PatientData) Promise~Patient~
            +setActive(id, active) Promise~Patient~
            +findById(id) Promise~Patient~
            +list(criteria: PatientCriteria) Promise~Patient[]~
            +count() Promise~number~
        }
        class patientRules {
            <<module>>
            +normalizePatientInput(input, today) PatientData
            +normalizeCpf(cpf) string
            +validateBirthDate(date, today) string
            +normalizePhone(phone) string
            +toSearchKey(text) string
        }
        class PatientValidationError {
            <<abstract exception>>
            +PatientValidationErrorCode code
        }
        class InvalidPatientNameError {
            <<exception>>
            PATIENT_NAME_EMPTY
            PATIENT_NAME_TOO_LONG
        }
        class InvalidCpfError {
            <<exception>>
            CPF_EMPTY
            CPF_WRONG_LENGTH
            CPF_INVALID
        }
        class InvalidBirthDateError {
            <<exception>>
            BIRTH_DATE_EMPTY
            BIRTH_DATE_INVALID
            BIRTH_DATE_IN_FUTURE
        }
        class InvalidGenderError {
            <<exception>>
            GENDER_INVALID
        }
        class InvalidPhoneError {
            <<exception>>
            PHONE_EMPTY
            PHONE_INVALID
        }
        class InvalidPatientEmailError {
            <<exception>>
            PATIENT_EMAIL_INVALID
        }
        class InvalidAddressError {
            <<exception>>
            ADDRESS_TOO_LONG
        }
        class InvalidLegalBasisError {
            <<exception>>
            LEGAL_BASIS_MISSING
            LEGAL_BASIS_INVALID
        }
        class DuplicatePatientError {
            <<exception>>
            CPF_ALREADY_REGISTERED
        }
        class PatientNotFoundError {
            <<exception>>
            PATIENT_NOT_FOUND
        }
        class PatientPersistenceError {
            <<exception>>
        }
        class User
    }
    namespace infra {
        class InMemoryPatientRepository {
            -Patient[] storedPatients
            -number nextId
        }
        class SqlitePatientRepository {
            -Database database
            -accessStorage(operation) T
        }
        class patientRepositoryFactory {
            <<module>>
            +createPatientRepository(mechanism) Promise~PatientRepository~
            +getPatientRepository() Promise~PatientRepository~
        }
        class patients {
            <<table>>
            id integer PK
            name text
            search_name text indexed
            cpf text unique
            birth_date text
            gender text
            phone text
            email text null
            address text null
            legal_basis text
            active integer
            created_by integer FK users.id
        }
    }

    PatientController --> PatientRepository
    PatientController ..> PatientInput : recebe
    PatientController ..> patientRules : valida e normaliza com
    PatientController ..> PatientNotFoundError : lança
    Patient --> Gender
    Patient --> LegalBasis
    Patient "*" --> "1" User : cadastrado por
    patientRules ..> PatientValidationError : lança
    PatientValidationError <|-- InvalidPatientNameError
    PatientValidationError <|-- InvalidCpfError
    PatientValidationError <|-- InvalidBirthDateError
    PatientValidationError <|-- InvalidGenderError
    PatientValidationError <|-- InvalidPhoneError
    PatientValidationError <|-- InvalidPatientEmailError
    PatientValidationError <|-- InvalidAddressError
    PatientValidationError <|-- InvalidLegalBasisError
    PatientValidationError <|-- DuplicatePatientError
    PatientRepository <|.. InMemoryPatientRepository
    PatientRepository <|.. SqlitePatientRepository
    InMemoryPatientRepository ..> DuplicatePatientError : lança
    SqlitePatientRepository ..> DuplicatePatientError : lança
    SqlitePatientRepository ..> PatientPersistenceError : converte falhas do banco
    SqlitePatientRepository ..> patients : lê e grava
    patientRepositoryFactory ..> InMemoryPatientRepository : cria se memory
    patientRepositoryFactory ..> SqlitePatientRepository : cria se sqlite
```

O paciente guarda o CPF e o telefone só com os dígitos, e a coluna `search_name` guarda o nome em minúsculas e sem acentos (`toSearchKey`), usada na busca e na ordem alfabética (RF14). O repositório em RAM usa a mesma função, então os dois mecanismos devolvem a mesma lista. `Gender` segue o `AdministrativeGender` do FHIR R4 e `LegalBasis`, as bases legais da LGPD para dados de saúde (NF-PRI-01). A edição troca os dados, mas não muda a situação nem o autor (`createdBy`); a inativação só muda `active`, e não há exclusão (RF13).

### Os dois mecanismos de persistência

Os controles dependem só das interfaces `UserRepository` e `PatientRepository`. A variável `STORAGE`, lida uma única vez na inicialização (`readStorageMechanism`), escolhe o mesmo mecanismo para as duas entidades (NF-MAN-01, [ADR-0006](07-arquitetura/adr/0006-repositorio-de-usuarios.md)):

| `STORAGE` | Implementações | Comportamento |
|---|---|---|
| `memory` | `InMemoryUserRepository`, `InMemoryPatientRepository` | Coleções em RAM; os dados somem quando o processo termina |
| `sqlite` | `SqliteUserRepository`, `SqlitePatientRepository` | Tabelas `users` e `patients` no banco da `DATABASE_URL` (arquivo local ou Turso); os dados sobrevivem ao reinício |

As implementações de cada entidade passam pelos mesmos testes de contrato (`user-repository.contract.test.ts`, `patient-repository.contract.test.ts`). Falhas do banco são capturadas em `accessStorage` e convertidas em `UserPersistenceError` ou `PatientPersistenceError` (NF-CON-01). E-mail, login e CPF repetidos são barrados pelos índices únicos, inclusive em cadastros simultâneos. As regras lançam uma exceção por campo, e cada caso tem um código próprio; a interface mostra a mensagem desse código no idioma do usuário (`<capacidade>.errors.<código>` em `messages/`).

## 3. Padrões de projeto utilizados

Preencha uma linha por padrão aplicado. Cada padrão relevante também tem um ADR.

| Padrão | Sprint | Classes participantes (papel no padrão) | Problema que resolve no projeto | ADR |
|---|---|---|---|---|
| Singleton | S3 | `FacadeSingletonController` (singleton: construtor privado, campo estático `instance`, `getInstance`) | Os controles e os repositórios são montados uma única vez por processo, e todas as telas e rotas usam a mesma instância | [ADR-0007](07-arquitetura/adr/0007-fachada-unica.md) |
| Facade | S3 | `FacadeSingletonController` (fachada); `UserController`, `AuthenticationController`, `PatientController` (subsistema); páginas, Server Actions e rotas de API (clientes) | As fronteiras chamam um só objeto, com um método por caso de uso, e a verificação do papel (NF-SEG-02) fica num só lugar; `countRegisteredEntities` informa quantas entidades estão cadastradas | [ADR-0007](07-arquitetura/adr/0007-fachada-unica.md) |
| Repository | S4 | | | |
| Factory Method / Abstract Factory | S4 | | | |
| Adapter | S4 | | | |
| Template Method | S4 | | | |
| Command | S5 | | | |
| Memento | S5 | | | |
