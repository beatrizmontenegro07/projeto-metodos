# ADR-0007: Usar uma fachada única (Facade + Singleton) como entrada da camada de negócio

- **Status:** aceito
- **Data:** 2026-10-19
- **Requisitos relacionados:** NF-SEG-02, NF-MAN-01, RF15, S3.2 ([cronograma](../../00-entregas.md))

## Contexto

Com pacientes e autenticação, a camada de negócio passa a ter três controles (`UserController`, `AuthenticationController`, `PatientController`) e dois repositórios. Sem um ponto de entrada, cada rota de API e cada tela montaria os controles, escolheria os repositórios e repetiria a verificação do papel do usuário (NF-SEG-02). A Sprint 3 pede uma fachada única para os controles, com uma única instância e um método que informa quantas entidades estão cadastradas.

## Decisão

Criar `FacadeSingletonController` (`src/modules/facade/facade-singleton-controller.ts`):

- **Facade:** expõe um método por operação de caso de uso (`signIn`, `addUser`, `listUsers`, `addPatient`, `updatePatient`, `deactivatePatient`, `searchPatients`, `countRegisteredEntities` etc.) e esconde os controles. Telas e rotas chamam só a fachada.
- **Autorização num só lugar:** cada operação feita em nome de um usuário recebe esse usuário e verifica a permissão do papel (`hasPermission`) antes de delegar; sem permissão, lança `AccessDeniedError`.
- **Singleton:** o construtor é privado e `getInstance(loadRepositories)` cria a instância na primeira chamada e a devolve nas seguintes. Como a camada de negócio não pode importar `src/infra` ([ADR-0001](0001-monolito-modular.md)), quem chama fornece os repositórios; o ponto de montagem é `getFacade()` (`src/infra/facade.ts`), que entrega os repositórios escolhidos pela variável `STORAGE` ([ADR-0006](0006-repositorio-de-usuarios.md)).
- **Totais (RF15):** `countRegisteredEntities(actor)` devolve `{ users, patients }`, apenas com os totais das áreas que o papel do usuário acessa.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Cada rota e tela chamando o controle | Repete a montagem dos controles e a verificação do papel em cada fronteira; uma fronteira esquecida expõe dados |
| Fachada criando os repositórios pela fábrica | A camada de negócio passaria a depender de `src/infra`, contra o [ADR-0001](0001-monolito-modular.md) |
| Instância única por variável de módulo | Não impede `new` em outro ponto do código e não mostra o padrão Singleton pedido na sprint |
| Verificar o papel só nas telas | As rotas de API e as Server Actions podem ser chamadas diretamente; a verificação precisa ficar na camada de negócio |

## Consequências

- Positivas: as fronteiras ficam finas (requisição → fachada → resposta); a regra de acesso por papel tem um único lugar e é testada sem HTTP; a Sprint 5 pode trocar o corpo da fachada por comandos (Command) sem mudar as fronteiras.
- Negativas / riscos: a fachada cresce com cada caso de uso; quando passar de algumas dezenas de métodos, ela será dividida por capacidade. Por ser Singleton com estado estático, os testes importam uma cópia nova da classe a cada caso (`vi.resetModules`).
