## ADDED Requirements

### Requirement: RF17 — Registrar acesso autenticado
O sistema DEVE gravar um registro com ID próprio, ID do usuário e data/hora UTC para cada autenticação por credenciais aceitas, antes de abrir a sessão. DEVE preservar acessos repetidos e NÃO DEVE gravar senha, hash, login, e-mail ou dados de pacientes. A persistência DEVE seguir `STORAGE` por Repository e Abstract Factory.

**Prioridade:** Essencial
**Casos de uso:** UC04

#### Scenario: Login aceito
- **GIVEN** um usuário cadastrado
- **WHEN** suas credenciais são aceitas por tela ou API
- **THEN** um registro com usuário e horário UTC é gravado antes da abertura da sessão e da tentativa de log Pino

#### Scenario: Login recusado
- **WHEN** o identificador ou a senha é inválido
- **THEN** nenhum acesso é gravado

#### Scenario: Acessos repetidos
- **GIVEN** um usuário já autenticado anteriormente
- **WHEN** ele autentica novamente, inclusive no mesmo instante
- **THEN** um novo registro é criado com outro ID

#### Scenario: SQLite e memória
- **GIVEN** registros de acesso já gravados
- **WHEN** a aplicação é reiniciada
- **THEN** SQLite preserva os registros, enquanto a coleção RAM inicia vazia

#### Scenario: Falha na gravação
- **WHEN** a persistência do acesso falha após a validação das credenciais
- **THEN** a operação falha com erro de persistência e nenhuma sessão é aberta
- **AND** a API responde 503 com `STORAGE_UNAVAILABLE` e a tela usa a mensagem traduzida de indisponibilidade

#### Scenario: Falha apenas no log
- **GIVEN** um acesso persistido
- **WHEN** o logger lança uma exceção síncrona
- **THEN** o acesso continua consultável e a autenticação não é recusada por essa exceção

### Requirement: RF18 — Gerar estatísticas de acesso
O sistema DEVE permitir ao Administrador gerar relatórios HTML e CSV por período UTC `[início, fim)`, usando Template Method na camada business. DEVE exibir, por usuário com acessos no período, ID, quantidade e último acesso, além do total geral. NÃO DEVE expor credenciais ou dados de pacientes.

**Prioridade:** Essencial
**Casos de uso:** UC15

#### Scenario: Dois formatos
- **GIVEN** um Administrador e um período válido
- **WHEN** ele solicita o relatório em HTML ou CSV
- **THEN** os dois formatos apresentam as mesmas estatísticas calculadas dos registros persistidos

#### Scenario: Limites e repetição
- **GIVEN** acessos repetidos pelo mesmo usuário, inclusive nos limites do período
- **WHEN** o relatório é gerado
- **THEN** cada registro no início é incluído, cada registro no fim é excluído e repetições são contadas individualmente

#### Scenario: Período vazio
- **WHEN** não existem acessos no período
- **THEN** o relatório apresenta total zero e nenhuma linha de usuário

#### Scenario: Papel sem permissão
- **GIVEN** um usuário sem papel Administrador
- **WHEN** ele solicita o relatório
- **THEN** o sistema nega a operação sem expor os registros

#### Scenario: Período inválido
- **WHEN** o início ou o fim é inválido ou o início não antecede o fim
- **THEN** o sistema recusa a geração com erro específico de período
