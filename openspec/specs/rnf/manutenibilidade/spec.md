# rnf/manutenibilidade Specification

## Purpose
Requisitos não funcionais de facilidade de modificar e substituir partes do CliniCore, como o mecanismo de persistência.

## Requirements

### Requirement: NF-MAN-01 — Persistência substituível
O sistema DEVE permitir escolher, na inicialização, o mecanismo de armazenamento dos usuários e pacientes entre uma coleção em memória (RAM) e um banco de dados SQLite (arquivo local ou Turso), pela variável `STORAGE` (`memory` ou `sqlite`), sem alterar o código das regras de negócio, que dependem apenas das interfaces `UserRepository` e `PatientRepository`. Uma Abstract Factory (`RepositoryFactory`), com implementações para RAM e SQLite, DEVE criar os repositórios das duas entidades com o mesmo mecanismo; a família DEVE ser reutilizada durante a execução.

**Prioridade:** Essencial
**Casos de uso:** UC01, UC04, UC05, UC06, UC07, UC08, UC09, UC10

#### Scenario: Execução em memória
- **GIVEN** o sistema é iniciado com `STORAGE=memory`
- **WHEN** usuários são cadastrados e o sistema é reiniciado
- **THEN** a listagem fica vazia após o reinício

#### Scenario: Execução com banco de dados
- **GIVEN** o sistema é iniciado com `STORAGE=sqlite` e `DATABASE_URL=file:local.db`
- **WHEN** usuários são cadastrados e o sistema é reiniciado
- **THEN** a listagem exibe os mesmos usuários de antes do reinício

#### Scenario: Mecanismo desconhecido
- **WHEN** o sistema é iniciado sem `STORAGE` ou com um valor diferente de `memory` e `sqlite`
- **THEN** o sistema recusa iniciar o acesso aos repositórios informando os valores aceitos

#### Scenario: Família consistente de repositórios
- **GIVEN** o sistema é iniciado com um mecanismo válido em `STORAGE`
- **WHEN** a fachada solicita os repositórios de usuários e pacientes
- **THEN** ambos pertencem à família do mecanismo selecionado
- **AND** no modo SQLite ambos usam a mesma conexão, permitindo associar um paciente ao usuário que o cadastrou

#### Scenario: Seleção única durante a execução
- **GIVEN** a família de repositórios já foi solicitada
- **WHEN** novas chamadas simultâneas ou posteriores solicitam os repositórios
- **THEN** todas reutilizam a mesma família e os dados já cadastrados, sem reler `STORAGE`
