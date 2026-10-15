# rnf/usabilidade Specification

## Purpose
Requisitos não funcionais de facilidade de uso da interface do CliniCore.

## Requirements

### Requirement: NF-USA-01 — Operações fáceis de encontrar
O sistema DEVE permitir que um usuário encontre, a partir da tela inicial, qualquer operação permitida ao seu papel em no máximo 10 segundos (NF01 do documento de requisitos).

**Prioridade:** Essencial
**Casos de uso:** UC01, UC05, UC06

#### Scenario: Recepcionista sem treinamento
- **GIVEN** uma Recepcionista que nunca usou o sistema, na tela inicial
- **WHEN** ela recebe a tarefa "abra o cadastro de um novo paciente"
- **THEN** ela chega à tela de cadastro sem ajuda em até 10 segundos

#### Scenario: Administrador sem treinamento
- **GIVEN** um Administrador que nunca usou o sistema, na tela inicial
- **WHEN** ele recebe a tarefa "veja a lista de usuários cadastrados"
- **THEN** ele chega à listagem de usuários sem ajuda em até 10 segundos
