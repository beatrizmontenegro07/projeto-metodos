# rnf/manutenibilidade Specification

## Purpose
Requisitos não funcionais de facilidade de modificar e substituir partes do CliniCore, como o mecanismo de persistência.

## Requirements

### Requirement: NF-MAN-01 — Persistência substituível
O sistema DEVE permitir escolher, na inicialização, o mecanismo de armazenamento dos dados entre memória (RAM) e armazenamento permanente (banco de dados SQLite local ou hospedado no Turso), pela variável `DATABASE_URL`, sem alterar o código das regras de negócio.

**Prioridade:** Essencial
**Casos de uso:** UC05, UC06

#### Scenario: Execução em memória
- **GIVEN** o sistema é iniciado com `DATABASE_URL=:memory:`
- **WHEN** usuários são cadastrados e o sistema é reiniciado
- **THEN** a listagem fica vazia após o reinício

#### Scenario: Execução com armazenamento permanente
- **GIVEN** o sistema é iniciado com `DATABASE_URL=file:local.db`
- **WHEN** usuários são cadastrados e o sistema é reiniciado
- **THEN** a listagem exibe os mesmos usuários de antes do reinício
