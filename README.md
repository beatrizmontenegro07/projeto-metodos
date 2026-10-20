# 🏥 CliniCore - CRM Médico Ambulatorial

![Status do Projeto](https://img.shields.io/badge/Status-Em%20Desenvolvimento-blue)
![Next.js](https://img.shields.io/badge/App-Next.js%20%2B%20TypeScript-000000?logo=nextdotjs&logoColor=white)
![SQLite](https://img.shields.io/badge/Database-SQLite%20%2B%20Drizzle-003B57?logo=sqlite&logoColor=white)
![FHIR](https://img.shields.io/badge/Interoperabilidade-HL7%20FHIR-E3242B)

O **CliniCore** é um sistema de CRM (*Customer/Clinic Relationship Management*) desenvolvido para clínicas médicas. Seu objetivo é centralizar e otimizar o relacionamento com pacientes, a gestão da agenda de consultas e o histórico de comunicações. 

Diferente de um Prontuário Eletrônico (PEP/EHR) hospitalar complexo, o CliniCore foca na agilidade ambulatorial e na retenção de pacientes, possuindo como diferencial a adoção do padrão internacional **HL7 FHIR (R4)** para garantir total interoperabilidade com sistemas externos de saúde.

---

## 👥 Equipe

Projeto da disciplina **Métodos de Projeto de Software** (UFPB, 2026.2), com o professor Raoni Kulesza.

| Integrante | Matrícula | GitHub |
|---|---|---|
| Beatriz Montenegro Maia Chaves | 20230012233 | [@beatrizmontenegro07](https://github.com/beatrizmontenegro07) |
| Frankley Kaiky M. Silva | 20220060460 | [@Franky03](https://github.com/Franky03) |
| Pedro Luca Vaz Matias | 20230089874 | [@PucaVaz](https://github.com/PucaVaz) |

---

## ✨ Principais Funcionalidades

- 🧑‍🤝‍🧑 **Gestão de Pacientes e Profissionais:** Cadastro unificado de pacientes, médicos e configuração da clínica.
- 📅 **Gestão de Agendamentos (Grade Ambulatorial):** Criação de horários de agenda (Schedules/Slots) e marcação de consultas.
- 🩺 **Registro de Atendimentos:** Interface ágil para o profissional de saúde registrar o encontro clínico, diagnósticos básicos e observações.
- 🔔 **Comunicações e Lembretes:** Histórico de interações e disparos automatizados para confirmação de agendamentos.
- 🔒 **Controle de Acesso Segregado:** Autenticação e autorização via perfis (Recepcionista, Médico, Administrador, Paciente) baseada no princípio do menor privilégio (RBAC).

---

## 🛠️ Tecnologias e Arquitetura

O CliniCore é um único aplicativo web full-stack, organizado em camadas (ver [ADR-0004](docs/07-arquitetura/adr/0004-nextjs-typescript-sqlite.md)):

*   **Aplicação (Interface e Servidor):** **Next.js** (App Router) com **TypeScript**; componentes de interface com **shadcn/ui** e **Tailwind CSS**.
*   **Regras de Negócio:** módulos por capacidade em `src/modules/` (`users`, `patients`, `appointments`, `encounters`), independentes das telas.
*   **Idiomas (i18n):** código em inglês; textos da interface traduzidos com **next-intl** em `messages/` — **pt-BR** (padrão) e **en**. As URLs não têm idioma (`/login`): ele vem do cookie `NEXT_LOCALE` ou do navegador. Ver [ADR-0005](docs/07-arquitetura/adr/0005-ingles-no-codigo-e-i18n.md).
*   **Banco de Dados (Persistência):** **SQLite** com **Drizzle ORM** — arquivo local no desenvolvimento e **Turso** (SQLite hospedado) no deploy na **Vercel**.
*   **Interoperabilidade (FHIR Facade):** Camada dedicada à conversão dos dados internos do sistema para os recursos do padrão **HL7 FHIR** (`Patient`, `Practitioner`, `Appointment`, `Encounter`, etc.), permitindo integração nativa e segura com operadoras e redes de saúde externas.

---

## 🛡️ Segurança e Conformidade (LGPD)
Por lidar com dados pessoais sensíveis, o sistema foi projetado sob os pilares da LGPD, garantindo criptografia de dados em trânsito (HTTPS/TLS), trilhas de auditoria (logs de operações) e segregação de permissões de acesso aos prontuários e contatos.

---

## 🚀 Como executar o projeto localmente

### Pré-requisitos
- Node.js 22.12 ou superior

### Passos
1. Clone o repositório e instale as dependências:
   ```bash
   git clone https://github.com/beatrizmontenegro07/projeto-metodos.git
   cd projeto-metodos
   npm install
   ```
2. Configure o banco local e aplique as migrações:
   ```bash
   cp .env.sample .env.local
   npm run db:migrate
   ```
   Preencha `SESSION_SECRET` no `.env.local` com o resultado de `openssl rand -base64 32`.
3. Inicie a aplicação em http://localhost:3000:
   ```bash
   npm run dev
   ```

### Mecanismo de armazenamento

O mecanismo é escolhido na inicialização pela variável `STORAGE` ([ADR-0006](docs/07-arquitetura/adr/0006-repositorio-de-usuarios.md)):

| `STORAGE` | Mecanismo | Classe |
|---|---|---|
| `memory` | Coleção em RAM — os dados somem quando o processo termina | `InMemoryUserRepository` |
| `sqlite` | Banco SQLite na `DATABASE_URL` (padrão do `.env.sample`) | `SqliteUserRepository` |

Com `sqlite`, a `DATABASE_URL` aponta para um arquivo local (`file:local.db`) ou para o Turso (`libsql://<banco>.turso.io`, com `DATABASE_AUTH_TOKEN`).

Para rodar só em memória, sem banco nem migrações: `STORAGE=memory npm run dev`.

### Testando as rotas de API

As rotas chamam a fachada `FacadeSingletonController` ([ADR-0007](docs/07-arquitetura/adr/0007-fachada-unica.md)) e exigem sessão ([ADR-0008](docs/07-arquitetura/adr/0008-sessao-em-cookie-assinado.md)). Com o app rodando e o sistema vazio, crie o primeiro Administrador e guarde o cookie de sessão:

```bash
# primeiro Administrador (só com o sistema vazio); já abre a sessão
curl -c cookies.txt -X POST localhost:3000/api/auth/first-administrator -H 'content-type: application/json' \
  -d '{"name":"Carla Souza","email":"carla@clinicore.com","login":"carla","password":"Secret@123"}'

# entrar com login ou e-mail
curl -c cookies.txt -X POST localhost:3000/api/auth/session -H 'content-type: application/json' \
  -d '{"identifier":"carla","password":"Secret@123"}'

# cadastrar e listar usuários (só o Administrador)
curl -b cookies.txt -X POST localhost:3000/api/users -H 'content-type: application/json' \
  -d '{"name":"Ana Silva","email":"ana@clinicore.com","login":"ana","password":"Secret@123","role":"RECEPTIONIST"}'
curl -b cookies.txt localhost:3000/api/users

# pacientes (Administrador ou Recepcionista)
curl -b cookies.txt -X POST localhost:3000/api/patients -H 'content-type: application/json' \
  -d '{"name":"Joana Souza Lima","cpf":"123.456.789-09","birthDate":"1985-03-12","gender":"FEMALE","phone":"(83) 98765-4321","legalBasis":"HEALTH_PROTECTION"}'
curl -b cookies.txt 'localhost:3000/api/patients?search=joana&status=active'
curl -b cookies.txt localhost:3000/api/patients/1
curl -b cookies.txt -X PATCH localhost:3000/api/patients/1 -H 'content-type: application/json' -d '{"active":false}'

# sair
curl -b cookies.txt -X DELETE localhost:3000/api/auth/session
```

Cada erro volta com um código e uma mensagem específica, em pt-BR por padrão ou em inglês com `-H 'accept-language: en'`:

```json
{ "error": { "code": "LOGIN_HAS_NUMBERS", "message": "O login não pode conter números." } }
```

Sem sessão, as rotas respondem 401 (`UNAUTHENTICATED`); com um papel sem permissão, 403 (`ACCESS_DENIED`).

### Esquema e migrações

O esquema fica em [`src/db/schema.ts`](src/db/schema.ts). Depois de alterá-lo, gere a migração e aplique-a:

```bash
npm run db:generate
npm run db:migrate
```

As migrações geradas em `drizzle/` são versionadas; nunca edite uma migração já aplicada.

### Testes e verificação

```bash
npm test        # Vitest, com SQLite em memória (não precisa de .env)
npm run lint
npm run build
```

### Deploy na Vercel

1. Crie um banco no [Turso](https://turso.tech) e gere um token de acesso.
2. Na Vercel, defina `STORAGE=sqlite`, `DATABASE_URL` (`libsql://...`), `DATABASE_AUTH_TOKEN` e `SESSION_SECRET` (`openssl rand -base64 32`) nas variáveis de ambiente do projeto.
3. Antes de publicar uma versão que altere o esquema, aplique as migrações no Turso:
   ```bash
   DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run db:migrate
   ```

### Estrutura

```text
src/
├── app/
│   ├── [locale]/   ← páginas; a URL não tem idioma (/login → [locale]/login)
│   └── api/        ← rotas de API
├── components/ui/  ← componentes shadcn/ui
├── db/             ← cliente do banco e esquema Drizzle
├── infra/          ← mecanismos de armazenamento (RAM e SQLite) de cada capacidade
├── i18n/           ← idiomas suportados e configuração do next-intl
├── lib/            ← utilitários compartilhados
├── modules/        ← regras de negócio por capacidade (ex.: users)
└── proxy.ts        ← escolhe o idioma e reescreve a rota
messages/           ← catálogos de tradução (en.json é a fonte)
drizzle/            ← migrações SQL geradas
```