# 🏥 CliniCore - CRM Médico Ambulatorial

![Status do Projeto](https://img.shields.io/badge/Status-Em%20Desenvolvimento-blue)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white)
![FHIR](https://img.shields.io/badge/Interoperabilidade-HL7%20FHIR-E3242B)

O **CliniCore** é um sistema de CRM (*Customer/Clinic Relationship Management*) desenvolvido para clínicas médicas. Seu objetivo é centralizar e otimizar o relacionamento com pacientes, a gestão da agenda de consultas e o histórico de comunicações. 

Diferente de um Prontuário Eletrônico (PEP/EHR) hospitalar complexo, o CliniCore foca na agilidade ambulatorial e na retenção de pacientes, possuindo como diferencial a adoção do padrão internacional **HL7 FHIR (R4)** para garantir total interoperabilidade com sistemas externos de saúde.

---

## ✨ Principais Funcionalidades

- 🧑‍🤝‍🧑 **Gestão de Pacientes e Profissionais:** Cadastro unificado de pacientes, médicos e configuração da clínica.
- 📅 **Gestão de Agendamentos (Grade Ambulatorial):** Criação de horários de agenda (Schedules/Slots) e marcação de consultas.
- 🩺 **Registro de Atendimentos:** Interface ágil para o profissional de saúde registrar o encontro clínico, diagnósticos básicos e observações.
- 🔔 **Comunicações e Lembretes:** Histórico de interações e disparos automatizados para confirmação de agendamentos.
- 🔒 **Controle de Acesso Segregado:** Autenticação e autorização via perfis (Recepcionista, Médico, Administrador, Paciente) baseada no princípio do menor privilégio (RBAC).

---

## 🛠️ Tecnologias e Arquitetura

A arquitetura do sistema adota um padrão multicamadas baseada em Web Services RESTful, estruturada da seguinte forma:

*   **Frontend (Camada de Apresentação):** Single Page Application (SPA) responsiva construída com **React**.
*   **Backend (API & Regras de Negócio):** Servidor em **Node.js com Express**, responsável pelo roteamento, segurança (JWT) e orquestração dos serviços (Pacientes, Agendamentos, Atendimentos).
*   **Banco de Dados (Persistência):** Banco de dados relacional **PostgreSQL**, otimizado para o fluxo diário do CRM.
*   **Interoperabilidade (FHIR Facade):** Camada dedicada à conversão dos dados internos do sistema para os recursos do padrão **HL7 FHIR** (`Patient`, `Practitioner`, `Appointment`, `Encounter`, etc.), permitindo integração nativa e segura com operadoras e redes de saúde externas.

---

## 🛡️ Segurança e Conformidade (LGPD)
Por lidar com dados pessoais sensíveis, o sistema foi projetado sob os pilares da LGPD, garantindo criptografia de dados em trânsito (HTTPS/TLS), trilhas de auditoria (logs de operações) e segregação de permissões de acesso aos prontuários e contatos.

---

## 🚀 Como executar o projeto localmente

Nesta primeira entrega, implementei o núcleo de usuários em memória. Ele ainda não depende de banco de dados nem de servidor HTTP.

### Pré-requisitos
- Node.js (v18+)

### Passos
1. Clone o repositório e entre na pasta:
   ```bash
   git clone https://github.com/beatrizmontenegro07/projeto-metodos.git
   cd projeto-metodos
   ```
2. Execute os testes:
   ```bash
   npm test
   ```

Os testes verificam a adição de usuários, a validação de papéis, a prevenção de e-mails duplicados e a listagem de usuários cadastrados.