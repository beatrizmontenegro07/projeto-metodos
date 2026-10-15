# Glossário

> Seção 3 do modelo. Ordem alfabética. Use exatamente estes termos nas specs, nos casos de uso e nos diagramas de análise.
> O código é escrito em inglês: a coluna **No código** dá o nome correspondente ([ADR-0005](07-arquitetura/adr/0005-ingles-no-codigo-e-i18n.md)).

| Termo | Definição | Sinônimos a evitar | No código | Exemplo |
|---|---|---|---|---|
| **Administrador** | Gestor da clínica; configura a organização, gerencia usuários e extrai relatórios. | gestor, admin | `ADMIN` | — |
| **Agendamento** | Reserva de um bloco de tempo (horário) na agenda de um profissional de saúde para atender um paciente. | marcação, consulta marcada | `Appointment` | — |
| **Atendimento** | Evento em que a interação entre paciente e profissional de saúde ocorre e em que observações e diagnósticos básicos são registrados. | encontro, sessão | `Encounter` | — |
| **CRM** | *Customer Relationship Management*: plataforma de gestão do relacionamento com o paciente (histórico de contatos, agenda, lembretes e retenção). | — | — | — |
| **FHIR** | *Fast Healthcare Interoperability Resources*: padrão do HL7 para troca eletrônica de informações de saúde. | — | — | Recurso `Patient` |
| **LGPD** | Lei Geral de Proteção de Dados (Lei nº 13.709/2018), que regula o tratamento de dados pessoais no Brasil. | — | — | — |
| **Login** | Identificador único com que o usuário entra no sistema: não vazio, até 12 caracteres e sem números (RF08). | usuário, username | `login` | ana |
| **Médico** | Profissional de saúde com papel de atendimento no sistema. | doutor | `DOCTOR` | — |
| **Paciente** | Indivíduo cadastrado na clínica que recebe ou está agendado para receber cuidados. É a entidade central do CRM. | cliente | `Patient` / `PATIENT` | — |
| **Papel** | Conjunto de funcionalidades a que um usuário tem acesso: Administrador, Recepcionista, Médico ou Paciente. | perfil, tipo de usuário | `Role` | Recepcionista |
| **Profissional de Saúde** | Colaborador da clínica autorizado a realizar atendimentos, ver a agenda de consultas e registrar anotações no histórico do paciente. | prestador | `Practitioner` | — |
| **Recepcionista** | Usuário de linha de frente que gerencia filas, agendamentos, contatos e o cadastro demográfico dos pacientes. | secretário, atendente | `RECEPTIONIST` | — |
| **Senha** | Segredo do usuário, de 8 a 128 caracteres, com pelo menos 3 tipos de caractere e diferente do login e do e-mail (RF09). Só o hash é armazenado. | — | `password` / `password_hash` | — |
| **Usuário** | Pessoa cadastrada no sistema com nome, e-mail, login, senha e um papel. | conta, pessoa | `User` | Ana Silva |
