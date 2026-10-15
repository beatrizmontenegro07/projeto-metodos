# rnf/manutenibilidade Specification

## Purpose
Requisitos não funcionais de facilidade de modificar e substituir partes do CliniCore, como o mecanismo de persistência.

## Requirements

### Requirement: NF-MAN-01 — Persistência substituível
O sistema DEVE permitir escolher, na inicialização, o mecanismo de armazenamento dos usuários entre uma coleção em memória (RAM) e um banco de dados SQLite (arquivo local ou Turso), pela variável `STORAGE` (`memory` ou `sqlite`), sem alterar o código das regras de negócio, que dependem apenas da interface `UserRepository`.

**Prioridade:** Essencial
**Casos de uso:** UC05, UC06

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
- **THEN** o sistema recusa iniciar o acesso aos usuários informando os valores aceitos
