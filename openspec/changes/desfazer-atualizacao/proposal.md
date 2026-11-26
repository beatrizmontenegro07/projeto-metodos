# Proposta: desfazer a última atualização do paciente

## Why
A Sprint 5 (Padrões 3) pede que a fachada da camada de negócio use o padrão Command e que a última atualização da entidade principal, o paciente, possa ser desfeita com o padrão Memento. Hoje uma edição errada só é corrigida digitando os dados antigos de novo.

## What Changes
- Cada operação de `FacadeSingletonController` vira um comando concreto executado por `CommandInvoker` (S5.1).
- Antes de cada edição aceita, o sistema guarda um snapshot imutável dos dados do paciente; "Desfazer última alteração" devolve os dados desse snapshot (S5.2).
- Tela do paciente com o botão "Desfazer última alteração" e rota `POST /api/patients/{id}/undo`.

## Capabilities
### New Capabilities
- Nenhuma.
### Modified Capabilities
- `pacientes`: RF19 (desfazer a última alteração do paciente).

## Impact
Fachada, comandos em `src/modules/facade/commands/`, Memento em `src/modules/patients/`, tela e API de pacientes, textos traduzidos e documentação (ADR-0012, ADR-0013, diagrama de classes de projeto e tabela de padrões). Sem mudança no banco.

## Fora do escopo
Histórico persistente (o histórico fica na memória do processo e se perde ao reiniciar), desfazer cadastro, inativação ou reativação, e refazer (redo).
