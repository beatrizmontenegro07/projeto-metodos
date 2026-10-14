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

O repositório está organizado em **monorepo** (NPM Workspaces) contendo:
- `backend/`: API HTTP em Node.js com autenticação JWT, controle de acesso por papéis (RBAC) e persistência em arquivo binário (`--storage=file`) ou em memória (`--storage=memory`).
- `frontend/`: Aplicação web em React + TypeScript + Vite com a interface de autenticação.

### Pré-requisitos
- Node.js (v18+)
- npm (v9+)

### 1. Instalação
Clone o repositório, entre na pasta do projeto e instale as dependências:
```bash
git clone https://github.com/beatrizmontenegro07/projeto-metodos.git
cd projeto-metodos
npm install
```

### 2. Executar os testes automatizados
Para rodar todas as suítes de teste (backend e frontend):
```bash
npm test
```

Ou separadamente por módulo:
```bash
npm test --workspace=backend
npm test --workspace=frontend
```

### 3. Iniciar o Backend e o Frontend

Em um **primeiro terminal**, inicie a API do backend (porta `3000`, utilizando persistência em arquivo binário `backend/usuarios.bin` por padrão):
```bash
JWT_SECRET="segredo-desenvolvimento" npm start
```
> Para iniciar o backend apenas em memória (`--storage=memory`), utilize `npm run start:memory`.

Em um **segundo terminal**, inicie o servidor de desenvolvimento do frontend (porta `5173`):
```bash
npm run dev --workspace=frontend
```

### 4. Testar o Login na Interface
Caso ainda não exista nenhum usuário cadastrado no arquivo local `backend/usuarios.bin`, cadastre um usuário inicial com o comando abaixo:
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Dra. Ana Silva",
    "login": "anasilva",
    "email": "ana.silva@clinicore.com",
    "senha": "Ana@Password1",
    "papel": "MEDICO"
  }'
```

Em seguida, acesse **`http://localhost:5173`** no navegador e faça login utilizando:
- **Usuário ou E-mail:** `anasilva` (ou `ana.silva@clinicore.com`)
- **Senha:** `Ana@Password1`

### 5. API de Gerenciamento de Pacientes

Todas as rotas exigem o cabeçalho `Authorization: Bearer <token>` (obtido em `POST /api/auth/login`) e um usuário com papel **`ADMINISTRADOR`** ou **`RECEPCIONISTA`**.

| Método | Rota | Descrição | Sucesso |
|--------|------|-----------|---------|
| `GET` | `/api/pacientes?pagina=1&tamanhoPagina=10` | Lista pacientes com paginação (`tamanhoPagina` máx. 100) | `200` |
| `GET` | `/api/pacientes/:id` | Consulta um paciente | `200` |
| `POST` | `/api/pacientes` | Cadastra um paciente | `201` |
| `PUT` | `/api/pacientes/:id` | Edita um paciente | `200` |
| `DELETE` | `/api/pacientes/:id` | Remove um paciente | `200` |

Códigos de erro: `400` dados ou parâmetros inválidos, `401` não autenticado, `403` papel sem permissão, `404` paciente inexistente, `409` CPF já cadastrado.

Os pacientes são persistidos em `backend/pacientes.bin` (modo `--storage=file`) ou apenas em memória (`--storage=memory`).

Exemplo de cadastro:
```bash
curl -X POST http://localhost:3000/api/pacientes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nomeCompleto": "Carlos Eduardo Santos",
    "cpf": "12345678901",
    "dataNascimento": "1985-04-12",
    "genero": "male",
    "telefones": [{ "numero": "83988776655", "tipo": "mobile" }],
    "email": "carlos@email.com"
  }'
```