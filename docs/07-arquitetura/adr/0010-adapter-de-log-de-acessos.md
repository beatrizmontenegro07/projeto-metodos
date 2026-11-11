# ADR-0010: Adapter para log de autenticações com Pino

- **Status:** aceito
- **Data:** 2026-11-11
- **Requisitos relacionados:** RF06, RF17, RF18, NF-SEG-04, S4.3

## Contexto

A autenticação é um cenário real para log operacional: registrar que um usuário teve suas credenciais aceitas, sem expor login, e-mail, senha ou hash. Importar uma biblioteca de log no controle acoplaria business à API externa.

## Decisão

Aplicar Adapter de objeto, por composição:

| Papel | Participante |
|---|---|
| Cliente | `AuthenticationController` |
| Target | `AccessLogger`, interface de business com `recordSignIn(userId)` |
| Adapter | `PinoAccessLogger`, em `src/infra/logging/` |
| Adaptee | `Logger` da biblioteca Pino, método `info(object)` |

O Adapter converte `recordSignIn(id)` em `info({ event: "USER_SIGNED_IN", userId: id })`. Pino acrescenta horário e metadados e escreve JSON em stdout. A montagem em `infra/facade.ts` injeta o Adapter na fachada, que o entrega ao controle. Business não conhece Pino. A API consultada está na [documentação oficial](https://github.com/pinojs/pino/blob/main/docs/api.md).

O controle registra uma vez após verificar a senha. Recusas não geram evento de sucesso. Exceções síncronas na emissão do log não impedem autenticação válida: o log é operacional e de melhor esforço, sem garantia de auditoria durável. O evento indica credenciais aceitas, antes da criação do cookie de sessão; não mede navegação nem o primeiro cadastro do administrador.

## Alternativas e consequências

- Chamar Pino ou `console` no controle viola o isolamento da camada business; uma interface própria permite substituir o fornecedor e usar um espião nos testes.
- O contrato recebe somente um ID, impedindo que o controle envie o usuário inteiro ou credenciais ao Adapter.
- A saída stdout depende da coleta de logs do ambiente. Os relatórios HTML e CSV usam a persistência consultável, independente da saída do Pino, conforme o complemento abaixo.
- Testes verificam o JSON produzido pelo Pino real, a integração pela fachada, as recusas de autenticação e a continuidade quando a emissão lança uma exceção.

## Complemento: dados consultáveis para estatísticas (RF17)

O log Pino não é a fonte de relatórios. `AccessRecordRepository` é um contrato de business com implementações RAM e SQLite selecionadas pela Abstract Factory. A tabela `access_records` guarda apenas ID do registro, FK do usuário e horário UTC; a migração é gerada por Drizzle.

A autenticação persiste o acesso antes de chamar o Adapter e abrir sessão. Erros do banco são convertidos em `AccessRecordPersistenceError`: a API responde 503 e o formulário informa indisponibilidade, sem criar sessão. A falha síncrona apenas no log mantém a autenticação e o registro. Essa separação evita perder estatísticas quando o coletor de stdout não existe. Um acesso representa credenciais aceitas, e não garante que o cookie posterior foi criado.

A consulta do Repository fornece os registros aos relatórios HTML e CSV por período UTC, implementados com `AccessReportTemplate` e suas especializações na camada business (RF18, [ADR-0011](0011-template-method-de-relatorios.md)). A fachada verifica a permissão de Administrador antes de gerar as estatísticas. A tela `/access-reports` e a rota `GET /api/access-reports` oferecem o download traduzido, sem cache compartilhado, conforme a change `relatorio-de-acessos`.
