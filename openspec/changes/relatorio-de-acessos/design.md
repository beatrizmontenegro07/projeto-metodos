# Projeto

O controle de autenticação grava `{ userId, occurredAt }` em `AccessRecordRepository`, após validar credenciais e antes do log Pino. A fábrica concreta cria o repositório com o mesmo mecanismo dos usuários e pacientes; SQLite compartilha a conexão e referencia `users.id`. O horário é ISO 8601 em UTC, obtido por relógio injetável no controle.

Falhas de SQLite viram `AccessRecordPersistenceError`. A fronteira informa indisponibilidade e não abre sessão; falhas síncronas do log continuam de melhor esforço. Um registro significa credenciais aceitas: se a criação posterior do cookie falhar, ele permanece.

Camada de geração: Template Method em business com coleta de registros, filtro por período UTC `[início, fim)`, agregação e renderização HTML/CSV. Somente Administrador pode gerar o relatório pela fachada. Dados exibidos: ID do usuário, quantidade de acessos e último acesso; total geral de acessos. Sem credenciais ou dados de pacientes. Decisão de integração registrada no ADR-0010.

A tela `/access-reports` usa `GET /api/access-reports`, que resolve o idioma da requisição e chama somente a fachada. A resposta de sucesso é um anexo HTML/CSV sem cache; as falhas usam códigos e mensagens traduzidos.
