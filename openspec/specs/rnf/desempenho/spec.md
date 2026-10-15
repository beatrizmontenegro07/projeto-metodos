# rnf/desempenho Specification

## Purpose
Requisitos não funcionais de tempo de resposta do CliniCore.

## Requirements

### Requirement: NF-DES-01 — Tempo de resposta das buscas
O sistema DEVE retornar a busca de pacientes e a consulta de horários disponíveis na agenda em no máximo 2 segundos no percentil 95, com até 10.000 pacientes cadastrados (NF04 do documento de requisitos).

**Prioridade:** Importante
**Casos de uso:** UC01, UC02

#### Scenario: Busca de paciente por nome
- **GIVEN** 10.000 pacientes cadastrados
- **WHEN** a Recepcionista busca pacientes pelo nome "Silva" 100 vezes seguidas
- **THEN** pelo menos 95 das 100 buscas retornam o resultado em até 2 segundos

#### Scenario: Consulta de horários disponíveis
- **GIVEN** um Profissional de Saúde com a agenda do mês configurada
- **WHEN** a Recepcionista consulta os horários disponíveis dele 100 vezes seguidas
- **THEN** pelo menos 95 das 100 consultas retornam os horários em até 2 segundos
