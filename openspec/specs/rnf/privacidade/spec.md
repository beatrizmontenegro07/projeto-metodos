# rnf/privacidade Specification

## Purpose
Requisitos não funcionais de tratamento de dados pessoais e de saúde conforme a LGPD.

## Requirements

### Requirement: NF-PRI-01 — Adequação à LGPD
O sistema DEVE registrar a base legal (e o consentimento, quando a base legal for o consentimento) de cada paciente cadastrado e DEVE pseudonimizar os dados usados em relatórios e bases analíticas, substituindo nome e CPF por um identificador sem significado (NF05 do documento de requisitos).

**Prioridade:** Essencial
**Casos de uso:** UC01

#### Scenario: Cadastro sem base legal
- **WHEN** a Recepcionista tenta cadastrar um paciente sem informar a base legal do tratamento dos dados
- **THEN** o sistema recusa o cadastro informando que a base legal é obrigatória

#### Scenario: Relatório analítico pseudonimizado
- **GIVEN** 500 pacientes cadastrados com nome e CPF
- **WHEN** o Administrador exporta um relatório analítico de atendimentos
- **THEN** 0 das 500 linhas exportadas contém o nome ou o CPF de um paciente
