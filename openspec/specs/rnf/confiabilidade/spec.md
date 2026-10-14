# rnf/confiabilidade Specification

## Purpose
Requisitos não funcionais de integridade dos dados do CliniCore diante de falhas de armazenamento.

## Requirements

### Requirement: NF-CON-01 — Falha de armazenamento tratada
O sistema NÃO DEVE encerrar nem perder os dados já gravados quando o armazenamento permanente falhar (arquivo inacessível, banco fora do ar ou sem as tabelas); DEVE sinalizar a falha com um erro de persistência próprio, para que o usuário seja informado de que a operação não foi concluída.

**Prioridade:** Essencial
**Casos de uso:** UC05, UC06

#### Scenario: Banco sem as tabelas
- **GIVEN** o sistema usa um arquivo SQLite em que as migrações não foram aplicadas
- **WHEN** a listagem de usuários é solicitada
- **THEN** o sistema sinaliza um erro de persistência e continua em execução
