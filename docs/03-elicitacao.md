# Elicitação de requisitos

> Seção 4 do modelo. Para cada técnica, registre **por que** foi escolhida e **quando, onde e com quem** foi aplicada.
> Anexos (roteiros, respostas, fotos) ficam em `docs/03-elicitacao/anexos/`.

## 4.1 Reunião de grupo

| Campo | Registro |
|---|---|
| Data e horário | 29/09/2026, 18h34, a 30/09/2026, 18h58 |
| Local | Remoto, por mensagens no WhatsApp |
| Participantes | Pedro Luca Vaz Matias, Beatriz Montenegro Maia Chaves, Frankley Kaiky M. Silva |

**Por que esta técnica:** o projeto ainda estava na definição do tema, e os integrantes precisavam alinhar a necessidade atendida, os atores e os riscos iniciais.

**Principais achados:**
- O escopo é um CRM ambulatorial voltado à gestão do relacionamento e dos agendamentos, sem a complexidade de um prontuário eletrônico hospitalar → escopo negativo da [visão](01-visao.md).
- Os atores são Administrador da clínica, Recepcionista, Profissional de Saúde e Paciente → papéis do RF07.
- É necessária uma interface de interoperabilidade baseada no HL7 FHIR → restrição R1.

## 4.2 Análise documental e benchmarking

| Campo | Registro |
|---|---|
| Período | 30/09/2026 a 01/10/2026, de forma assíncrona |
| Local | Remoto |
| Participantes | Pedro Luca Vaz Matias, Beatriz Montenegro Maia Chaves, Frankley Kaiky M. Silva |
| Documentos | Especificação HL7 FHIR R4; documentação de sistemas de gestão de clínicas do mercado; LGPD |

**Por que esta técnica:** na ausência de stakeholders reais, permite compreender os fluxos de trabalho de uma clínica e os requisitos técnicos de interoperabilidade sem depender de contato direto com usuários finais.

**Principais achados:**
- Os fluxos de trabalho padrão de uma clínica (cadastro, agenda, atendimento e comunicação com o paciente) → RF01–RF05.
- Os requisitos técnicos de interoperabilidade do HL7 FHIR → P3, restrição R1.

## 4.3 Considerações finais

A elicitação confirmou a necessidade de um sistema que separe a complexidade de um PEP robusto da agilidade exigida para gerir o relacionamento e a agenda, com uma base de dados que outros sistemas consigam interpretar via FHIR. Como não houve contato com stakeholders reais, os fluxos ainda não foram validados com usuários de uma clínica.

### Rastreabilidade problema → requisito

| Problema | Requisitos |
|---|---|
| P1 | RF01, RF05 |
| P2 | RF03, RF05 |
| P3 | NF06 (interoperabilidade FHIR) |
| P4 | RF04, RF06 |
