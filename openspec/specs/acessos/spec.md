# acessos Specification

## Purpose
Registrar credenciais aceitas para fornecer dados às estatísticas de acesso. O registro acontece antes da criação da sessão; não mede navegação e não inclui o cadastro inicial do administrador.

## Requirements

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
