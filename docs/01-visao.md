# Visão do sistema — CliniCore

> Equivale às seções 1 (Introdução) e 2 (Descrição geral) do modelo de documento de requisitos.

## 1. Introdução

### 1.1 Propósito deste repositório

Este repositório especifica e implementa o **CliniCore**, um CRM (*Customer/Clinic Relationship Management*) para clínicas médicas ambulatoriais. O sistema gerencia o relacionamento com os pacientes, possibilitando o agendamento, o acompanhamento de consultas e a comunicação. Um diferencial do projeto é a adoção do padrão **HL7 FHIR (R4)** para modelar e trocar dados de saúde com sistemas externos. O repositório é destinado à equipe de desenvolvimento e ao professor da disciplina.

### 1.2 Organização

| Onde | O quê |
|---|---|
| `docs/01-visao.md` | Este arquivo: motivação, problemas, escopo, usuários, restrições |
| `docs/02-glossario.md` | Termos do domínio |
| `docs/03-elicitacao.md` | Técnicas de elicitação usadas e seus registros |
| `openspec/specs/` | **Requisitos funcionais e não funcionais** (fonte da verdade) |
| `docs/04-casos-de-uso/` | Diagrama de casos de uso e os casos de uso detalhados |
| `docs/05-analise.md` | Diagrama de classes de análise |
| `docs/06-interface/` | Rascunhos de tela |
| `docs/07-arquitetura/` | Arquitetura (C4) e decisões (ADRs) |
| `docs/08-projeto.md` | Pacotes, diagrama de classes de projeto e padrões |
| `openspec/changes/` | Mudanças propostas nos requisitos, ainda não incorporadas |

### 1.3 Documentos relacionados

1. Especificação oficial HL7 FHIR (Release 4); 2019; Health Level Seven International.
2. Lei Geral de Proteção de Dados Pessoais (LGPD) — Lei nº 13.709; 2018; Presidência da República do Brasil.
3. Documento de requisitos do CliniCore (`docs/relatorio/main.pdf`); outubro de 2026; equipe do projeto.
4. [Glossário](02-glossario.md).

## 2. Descrição geral

### 2.1 Motivação

A gestão do relacionamento com pacientes em clínicas médicas sofre com dados fragmentados, ausência de um histórico de comunicação unificado e faltas frequentes em consultas. O CliniCore centraliza essas informações numa plataforma amigável, que aproxima a clínica do paciente e adota o padrão FHIR para se integrar a outras redes de atenção à saúde.

### 2.2 Problemas identificados

| # | Problema | Quem é afetado | Evidência |
|---|---|---|---|
| P1 | Dificuldade de rastrear o histórico de interações administrativas com o paciente | Recepcionista, Administrador | [Elicitação](03-elicitacao.md) |
| P2 | Alta taxa de faltas por deficiência na comunicação e nas notificações | Clínica, Paciente | [Elicitação](03-elicitacao.md) |
| P3 | Sistemas isolados que não conversam com prontuários externos ou operadoras de saúde | Clínica, Profissional de Saúde | [Elicitação](03-elicitacao.md) §4.2 |
| P4 | Falta de uma visão unificada sobre a saúde e o engajamento do paciente | Administrador, Profissional de Saúde | [Elicitação](03-elicitacao.md) |

### 2.3 Visão geral do sistema

**O sistema fará:**

Só o núcleo essencial (cerca de 20% das funcionalidades) tem requisitos detalhados, com cenários, em `openspec/specs/`. As demais funcionalidades mantêm o ID do [documento de requisitos](../relatorio/main.pdf) e só serão detalhadas quando entrarem numa sprint ([cronograma](00-entregas.md)).

| Funcionalidade | Requisito | Detalhamento |
|---|---|---|
| Gerenciamento de usuários (Administrador, Recepcionista, Médico e Paciente): cadastro com validação de login e senha, e listagem | RF07–RF10 | [`openspec/specs/usuarios/`](../openspec/specs/usuarios/spec.md) — Entrega 1 |
| Cadastro, edição e inativação de pacientes, com CPF único | RF01 | Change `crud-paciente` — Entrega 2 |
| Cadastro da clínica, dos profissionais de saúde e de suas especialidades | RF02 | Só nesta visão |
| Agendamento, cancelamento e reagendamento de consultas pela agenda dos profissionais | RF03 | Só nesta visão |
| Registro de atendimentos (encontros clínicos) e de observações em alto nível | RF04 | Só nesta visão |
| Registro das comunicações com o paciente e envio de lembretes de confirmação | RF05 | Só nesta visão |
| Acesso aos dados restrito a usuários autenticados, conforme o papel | RF06 | Login (UC04); regra de acesso em NF-SEG-02 |
| Exposição e consumo de recursos padronizados pelo HL7 FHIR | — | NF-INT-01 |

**O sistema NÃO fará (escopo negativo):**

| Funcionalidade | Motivo |
|---|---|
| Prontuário eletrônico do paciente (PEP/EHR) de alta complexidade | O foco é o relacionamento e a agenda ambulatorial, não o registro clínico completo |
| Gestão hospitalar (leitos, internação) | Fora do contexto ambulatorial |
| Prescrição eletrônica avançada | Exige regulamentação e integrações específicas |
| Faturamento hospitalar | Fora do escopo do CRM |
| Integração com equipamentos de diagnóstico por imagem | Fora do escopo do CRM |

**Integração com outros sistemas:** o CliniCore **não** é autocontido. Ele expõe e consome recursos HL7 FHIR para integrar-se a prontuários externos e operadoras de saúde, e envia lembretes por serviços externos de mensagem (e-mail, WhatsApp).

### 2.4 Usuários do sistema

| Usuário | Características | Principais dificuldades hoje |
|---|---|---|
| **Administrador / Gestor da clínica** | Configura a clínica, gerencia usuários e extrai relatórios de engajamento e faltas | Dados espalhados em planilhas e sistemas que não conversam |
| **Recepcionista / Secretário** | Linha de frente: filas, agendamentos, contatos e cadastro demográfico dos pacientes | Histórico de contatos com o paciente não fica registrado |
| **Profissional de Saúde (Médico)** | Visualiza a agenda diária e registra o encontro clínico de forma simplificada | Pouco tempo para registrar o atendimento |
| **Paciente** | Usuário externo; acessa um portal ou interage por notificações e lembretes de confirmação | Não é lembrado das consultas a tempo |

### 2.5 Suposições e restrições gerais

- **R1** — A arquitetura deve mapear e comunicar dados respeitando o padrão HL7 FHIR (R4).
- **R2** — Por tratar dados sensíveis de saúde, a conformidade com a LGPD é obrigatória.
- **R3** — Senhas seguem a política padrão do AWS IAM (RF09) e nunca são exibidas nem armazenadas em texto puro (NF-SEG-01).
- **R4** — O sistema roda como aplicação web na Vercel, com banco SQLite hospedado no Turso ([ADR-0004](07-arquitetura/adr/0004-nextjs-typescript-sqlite.md)).
- **S1** — Supõe-se conectividade com a internet para a operação e para a comunicação com APIs externas.
