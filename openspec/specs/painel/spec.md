# painel Specification

## Purpose
Página inicial do CliniCore após o login, com os totais de entidades cadastradas que cada papel pode consultar.

## Requirements

### Requirement: RF15 — Totais cadastrados
O sistema DEVE exibir na página inicial a quantidade de usuários e de pacientes cadastrados (pacientes ativos e inativos), mostrando a cada papel apenas os totais das áreas a que ele tem acesso (NF-SEG-02).

**Prioridade:** Importante
**Casos de uso:** UC10

#### Scenario: Totais para o Administrador
- **GIVEN** há 3 usuários e 5 pacientes cadastrados, 1 deles inativo
- **WHEN** o Administrador abre a página inicial
- **THEN** o sistema exibe 3 usuários e 5 pacientes

#### Scenario: Totais para o Recepcionista
- **GIVEN** há 3 usuários e 5 pacientes cadastrados
- **WHEN** a Recepcionista abre a página inicial
- **THEN** o sistema exibe 5 pacientes e não exibe o total de usuários

#### Scenario: Sistema recém-instalado
- **GIVEN** só o primeiro Administrador está cadastrado
- **WHEN** ele abre a página inicial
- **THEN** o sistema exibe 1 usuário e 0 pacientes
