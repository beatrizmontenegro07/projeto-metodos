# Design: cadastro de pacientes e fachada única

## Context

O módulo `users` já segue o padrão que a Entrega 1 consolidou: regras e controle em `src/modules/users`, interface `UserRepository` com duas implementações em `src/infra/users` (RAM e SQLite) escolhidas pela variável `STORAGE`, e um erro por campo com um código por caso ([ADR-0006](../../../docs/07-arquitetura/adr/0006-repositorio-de-usuarios.md)). A change `autenticacao` traz o usuário autenticado e as permissões por papel.

## Goals / Non-Goals

**Goals:**
- O módulo `patients` repete a estrutura de `users`, para que as duas entidades sejam lidas e testadas do mesmo jeito.
- Telas e rotas de API falam só com a fachada, nunca com um controle ou repositório.

**Non-Goals:**
- Repositório genérico ou fábrica abstrata para todas as entidades (Sprint 4).
- Mapeamento FHIR do paciente (NF-INT-01), que reaproveitará os campos escolhidos aqui.

## Decisions

### Modelo do paciente

| Campo | No código | Regra (RF11) | Armazenado como |
|---|---|---|---|
| Nome completo | `name` | 1 a 120 caracteres, sem espaços nas pontas | texto |
| CPF | `cpf` | 11 dígitos e dígitos verificadores | só os 11 dígitos, índice único |
| Data de nascimento | `birthDate` | data ISO `AAAA-MM-DD` existente e não futura | texto ISO |
| Sexo | `gender` | `MALE`, `FEMALE`, `OTHER`, `UNKNOWN` (FHIR `AdministrativeGender`) | texto |
| Telefone | `phone` | DDD + 8 ou 9 dígitos | só os dígitos |
| E-mail | `email` | opcional, formato `nome@dominio.tld` | minúsculas ou nulo |
| Endereço | `address` | opcional, até 200 caracteres | texto ou nulo |
| Base legal (LGPD) | `legalBasis` | `CONSENT`, `HEALTH_PROTECTION`, `LEGAL_OBLIGATION`, `LIFE_PROTECTION` | texto |
| Situação | `active` | criado ativo; muda só por inativar/reativar | booleano |
| Cadastrado por | `createdBy` | id do usuário autenticado | chave estrangeira para `users.id` |

Os códigos `gender` e `legalBasis` seguem o FHIR e a LGPD (art. 7º e 11), e a interface mostra os rótulos traduzidos. O CPF e o telefone são gravados sem pontuação para que a unicidade e a busca não dependam da formatação digitada; a tela formata na exibição.

### Uma exceção por campo

Como em `users`, cada campo tem sua classe de erro, todas subclasses de `PatientValidationError`: `InvalidPatientNameError`, `InvalidCpfError`, `InvalidBirthDateError`, `InvalidGenderError`, `InvalidPhoneError`, `InvalidPatientEmailError`, `InvalidAddressError`, `InvalidLegalBasisError` e `DuplicatePatientError` (`CPF_ALREADY_REGISTERED`). `PatientNotFoundError` (`PATIENT_NOT_FOUND`) e `PatientPersistenceError` ficam fora dessa hierarquia, porque não são dados inválidos. A tela mostra a mensagem `patients.errors.<código>` junto do campo.

### Busca sem acentos

A coluna `search_name` guarda o nome em minúsculas e sem acentos (`toSearchKey`, na camada de negócio), com índice. A busca por nome compara com essa chave, e a ordem alfabética usa a mesma chave e, no empate, o id. O repositório em RAM usa a mesma função, então os dois mecanismos devolvem a mesma lista; os testes de contrato verificam isso.

| Alternativa | Por que não |
|---|---|
| `LIKE` com `lower()` no SQLite | `lower()` do SQLite só trata ASCII: "JOÃO" não encontraria "joão" |
| Filtrar tudo em memória após o `SELECT` | Fere o NF-DES-01 com 10.000 pacientes |

### Repositório de pacientes

`PatientRepository` (`add`, `update`, `setActive`, `findById`, `list`, `count`) com `InMemoryPatientRepository` e `SqlitePatientRepository`, criados pela mesma variável `STORAGE` em `patient-repository-factory.ts`. O CPF repetido é barrado pelo índice único (SQLite) ou pela coleção (RAM) e vira `DuplicatePatientError`; falhas do banco viram `PatientPersistenceError` (NF-CON-01). Os testes de contrato rodam nas duas implementações.

### Fachada única: `FacadeSingletonController` (ADR-0007)

`src/modules/facade/facade-singleton-controller.ts` reúne `UserController`, `AuthenticationController` e `PatientController` e expõe um método por operação de caso de uso, mais `countRegisteredEntities()`, que devolve `{ users, patients }`. Cada operação recebe o usuário autenticado e verifica a permissão do papel (`MANAGE_USERS`, `MANAGE_PATIENTS`) antes de chamar o controle, lançando `AccessDeniedError`. O construtor é privado e `getInstance(loadRepositories)` cria a única instância na primeira chamada; a camada de negócio recebe os repositórios por essa função e continua sem importar `src/infra`. O ponto de montagem é `src/infra/facade.ts` (`getFacade()`), que entrega os repositórios escolhidos por `STORAGE`.

| Alternativa | Por que não |
|---|---|
| Rotas e telas chamando cada controle | É o estado atual; cada fronteira repetiria a montagem e a verificação de permissão |
| Singleton por variável de módulo, sem classe | Não mostra o padrão pedido na Sprint 3 e não impede uma segunda instância |

### Rotas e telas

- API: `GET`/`POST /api/patients` (busca com `?search=` e `?status=active|inactive|all`, cadastro) e `GET`/`PUT`/`PATCH /api/patients/{id}` (consulta, edição, e `{ "active": false | true }` para inativar ou reativar). Respostas de erro no formato `{ error: { code, message } }`: 400 dados inválidos, 401 sem sessão, 403 sem permissão, 404 paciente inexistente, 409 CPF repetido, 503 armazenamento indisponível.
- Telas: `/patients` (TL03) com busca e filtro na URL e paginação na tabela; `/patients/new` e `/patients/{id}` (TL04) com Server Actions que chamam a fachada. A página inicial (`/`) mostra os totais (RF15).

## Risks / Trade-offs

- [Lista inteira enviada para paginar na tela] → a busca e o filtro já reduzem a lista no servidor; paginação no servidor fica para quando o volume exigir.
- [Chave estrangeira `created_by` no modo `memory`] → o repositório em RAM não verifica a chave; o id vem sempre da sessão, que só existe para usuários cadastrados.
- [Dígitos verificadores aceitam CPFs válidos porém inexistentes] → a validação junto à Receita Federal está fora do escopo.
