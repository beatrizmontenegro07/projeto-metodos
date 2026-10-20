# Glossário

> Seção 3 do modelo. Ordem alfabética. Use exatamente estes termos nas specs, nos casos de uso e nos diagramas de análise.
> O código é escrito em inglês: a coluna **No código** dá o nome correspondente ([ADR-0005](07-arquitetura/adr/0005-ingles-no-codigo-e-i18n.md)).

| Termo | Definição | Sinônimos a evitar | No código | Exemplo |
|---|---|---|---|---|
| **Administrador** | Gestor da clínica; configura a organização, gerencia usuários e extrai relatórios. | gestor, admin | `ADMIN` | — |
| **Agendamento** | Reserva de um bloco de tempo (horário) na agenda de um profissional de saúde para atender um paciente. | marcação, consulta marcada | `Appointment` | — |
| **Armazenamento em memória** | Modo em que os dados ficam só na memória (RAM) do processo e somem quando o sistema é encerrado. Escolhido na inicialização (NF-MAN-01). | persistência volátil | `STORAGE=memory` (`InMemoryUserRepository`, `InMemoryPatientRepository`) | Demonstração e testes automatizados |
| **Armazenamento permanente** | Modo em que os dados são gravados num banco SQLite (arquivo local ou Turso) e sobrevivem ao reinício do sistema (NF-MAN-01). | persistência em disco | `STORAGE=sqlite` com `DATABASE_URL=file:local.db` | Uso diário da clínica |
| **Atendimento** | Evento em que a interação entre paciente e profissional de saúde ocorre e em que observações e diagnósticos básicos são registrados. | encontro, sessão | `Encounter` | — |
| **Base legal** | Hipótese da LGPD que autoriza o tratamento de um dado pessoal: consentimento do titular, tutela da saúde, cumprimento de obrigação legal ou proteção da vida. Obrigatória no cadastro do paciente (NF-PRI-01). | justificativa | `legalBasis` (`CONSENT`, `HEALTH_PROTECTION`, `LEGAL_OBLIGATION`, `LIFE_PROTECTION`) | Tutela da saúde |
| **CPF** | Cadastro de Pessoas Físicas: identificador único de um paciente no sistema, com 11 dígitos e dígitos verificadores válidos; dois pacientes não podem ter o mesmo CPF, nem quando um deles está inativo (RF01, RF11). Gravado só com os dígitos. | documento | `cpf` | 123.456.789-09 |
| **CRM** | *Customer Relationship Management*: plataforma de gestão do relacionamento com o paciente (histórico de contatos, agenda, lembretes e retenção). | — | — | — |
| **Fachada** | Ponto único de entrada da camada de negócio: telas e rotas de API pedem as operações a ela, que verifica o papel do usuário e chama o controle certo. Há uma só instância por processo ([ADR-0007](07-arquitetura/adr/0007-fachada-unica.md)). | controlador geral | `FacadeSingletonController` | — |
| **FHIR** | *Fast Healthcare Interoperability Resources*: padrão do HL7 para troca eletrônica de informações de saúde. | — | — | Recurso `Patient` |
| **Hash de senha** | Valor derivado da senha por uma função de mão única (scrypt com salt aleatório). É o único dado da senha que o sistema grava (NF-SEG-01). | senha criptografada | `password_hash` | — |
| **LGPD** | Lei Geral de Proteção de Dados (Lei nº 13.709/2018), que regula o tratamento de dados pessoais no Brasil. | — | — | — |
| **Login** | Identificador único com que o usuário entra no sistema: não vazio, até 12 caracteres e sem números (RF08). | usuário, username | `login` | ana |
| **Médico** | Profissional de saúde com papel de atendimento no sistema. | doutor | `DOCTOR` | — |
| **Paciente** | Indivíduo cadastrado na clínica que recebe ou está agendado para receber cuidados. É a entidade central do CRM; cada paciente fica vinculado ao usuário que o cadastrou. | cliente | `Patient` / `PATIENT` | Joana Souza Lima |
| **Paciente inativo** | Paciente cuja situação foi trocada para inativa (RF13): continua cadastrado, com todos os dados e o CPF reservado, e pode ser reativado. O sistema não exclui pacientes. | paciente excluído | `active = false` | — |
| **Papel** | Conjunto de funcionalidades a que um usuário tem acesso: Administrador, Recepcionista, Médico ou Paciente. | perfil, tipo de usuário | `Role` | Recepcionista |
| **Profissional de Saúde** | Colaborador da clínica autorizado a realizar atendimentos, ver a agenda de consultas e registrar anotações no histórico do paciente. | prestador | `Practitioner` | — |
| **Pseudonimização** | Troca de dados que identificam o paciente (nome, CPF) por um identificador sem significado, para uso em relatórios e análises (NF-PRI-01). | anonimização | — | Paciente #4821 |
| **RBAC** | *Role-Based Access Control*: controle de acesso em que cada papel libera um conjunto fixo de funcionalidades (NF-SEG-02). | — | `Role` | Só o Administrador lista usuários |
| **Recepcionista** | Usuário de linha de frente que gerencia filas, agendamentos, contatos e o cadastro demográfico dos pacientes. | secretário, atendente | `RECEPTIONIST` | — |
| **Senha** | Segredo do usuário, de 8 a 128 caracteres, com pelo menos 3 tipos de caractere e diferente do login e do e-mail (RF09). Só o hash é armazenado. | — | `password` / `password_hash` | — |
| **Sessão** | Período em que o usuário fica autenticado depois do login: dura 8 horas ou até ele sair (RF06). Guardada num cookie assinado ([ADR-0008](07-arquitetura/adr/0008-sessao-em-cookie-assinado.md)). | login ativo | cookie `session` | — |
| **Sexo** | Sexo administrativo do paciente, nos valores do padrão FHIR: Masculino, Feminino, Outro ou Desconhecido (RF11). | gênero | `gender` (`MALE`, `FEMALE`, `OTHER`, `UNKNOWN`) | Feminino |
| **Usuário** | Pessoa cadastrada no sistema com nome, e-mail, login, senha e um papel. | conta, pessoa | `User` | Ana Silva |
