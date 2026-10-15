# rnf/interoperabilidade Specification

## Purpose
Requisitos não funcionais de troca de dados de saúde com sistemas externos pelo padrão HL7 FHIR R4.

## Requirements

### Requirement: NF-INT-01 — Adoção do padrão HL7 FHIR R4
O sistema DEVE serializar e desserializar os dados demográficos dos pacientes e os agendamentos em JSON em conformidade com os recursos `Patient` e `Appointment` do HL7 FHIR R4 (NF06 do documento de requisitos).

**Prioridade:** Essencial
**Casos de uso:** UC01, UC02

#### Scenario: Exportar paciente em FHIR
- **GIVEN** um paciente cadastrado com nome, CPF, data de nascimento, sexo, telefone e endereço
- **WHEN** um sistema externo solicita esse paciente no formato FHIR
- **THEN** o JSON retornado é validado pelo validador oficial do HL7 FHIR R4 com 0 erros

#### Scenario: Importar paciente em FHIR
- **GIVEN** um recurso `Patient` FHIR R4 válido, com os 6 dados demográficos acima
- **WHEN** o sistema o recebe de um sistema externo
- **THEN** o paciente é cadastrado com os 6 dados preenchidos, sem perda de informação
