# ADR-0012: Fachada da camada de negócio baseada em Command

- **Status:** aceito
- **Data:** 2026-11-18
- **Requisitos relacionados:** S5.1, NF-SEG-02, RF19 ([cronograma](../../00-entregas.md))

## Contexto

Desde a Sprint 3, `FacadeSingletonController` é a entrada única da camada business (ADR-0007): cada método verifica o papel e chama o controle diretamente. A Sprint 5 pede que a fachada use o padrão Command, para que cada operação seja um objeto que pode ser executado de forma uniforme e, no caso da edição de paciente, combinado com o histórico que permite desfazer (ADR-0013).

## Decisão

- `Command<Result>` (`src/modules/facade/commands/command.ts`) declara `execute(): Promise<Result>`.
- Cada operação da fachada tem um comando concreto: `SignInCommand`; `FindUserCommand`, `HasUsersCommand`, `CreateFirstAdministratorCommand`, `AddUserCommand`, `ListUsersCommand`; `AddPatientCommand`, `UpdatePatientCommand`, `UndoPatientUpdateCommand`, `CanUndoPatientUpdateCommand`, `DeactivatePatientCommand`, `ReactivatePatientCommand`, `GetPatientCommand`, `SearchPatientsCommand`; `GenerateAccessReportCommand` e `CountRegisteredEntitiesCommand`.
- `CommandInvoker` executa qualquer comando conhecendo só a interface.
- Os receptores são os controles existentes (`UserController`, `AuthenticationController`, `PatientController`) e o Template Method dos relatórios.
- `FacadeSingletonController` é o cliente: verifica o papel, cria o comando com o receptor e os argumentos e o entrega ao Invoker. Continua Singleton, e telas, Server Actions e rotas de API continuam chamando só a fachada.

| Papel do Command | Participante |
|---|---|
| Command | `Command<Result>` |
| ConcreteCommand | os comandos listados acima |
| Invoker | `CommandInvoker` |
| Receiver | `UserController`, `AuthenticationController`, `PatientController`, `createAccessReport` / `AccessReportTemplate` |
| Client | `FacadeSingletonController` (as telas e rotas são clientes da fachada) |

## Consequências

- Um novo caso de uso é um novo comando e um método na fachada, sem mudar o Invoker.
- A verificação de papel fica antes da criação do comando, então um papel sem permissão não executa nada, como antes.
- O Invoker é o ponto único por onde passam todas as operações; registro, métricas ou fila podem ser acrescentados ali depois.
- Há mais classes pequenas; as assinaturas públicas da fachada não mudaram, por isso as fronteiras não precisaram ser alteradas, exceto para o novo desfazer.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Manter a fachada chamando os controles direto | Não atende S5.1 |
| Fronteiras criando os comandos e chamando o Invoker | Espalharia a verificação de papel e o acesso aos controles pela camada ui, contra ADR-0007 |
| Autorização dentro do Invoker | Exigiria que cada comando declarasse permissão e ator; a fachada já concentra essa regra |
