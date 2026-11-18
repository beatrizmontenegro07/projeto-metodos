# ADR-0013: Memento para desfazer a última atualização do paciente

- **Status:** aceito
- **Data:** 2026-11-18
- **Requisitos relacionados:** RF19, UC07, S5.2 ([cronograma](../../00-entregas.md))

## Contexto

A entidade principal do CliniCore é o paciente (CRUD da Sprint 3). A Sprint 5 pede desfazer a última atualização dessa entidade com o padrão Memento, sem expor o estado interno fora de quem o cria e restaura.

## Decisão

| Papel do Memento | Participante |
|---|---|
| Originator | `PatientController`: `createMemento(id)` lê o paciente e cria o memento; `restore(memento)` grava de volta os dados pelo `PatientRepository` |
| Memento | `PatientMemento`: `patientId` e uma cópia congelada (`Object.freeze`) de `PatientData`, lida só por `getState()` |
| Caretaker | `PatientUpdateHistory`: uma pilha de mementos por paciente, guardada pela fachada; usa só `patientId` e não inspeciona o estado |

O Memento se integra ao Command (ADR-0012): `UpdatePatientCommand` pede o memento ao Originator, executa a edição e só depois de ela ser aceita entrega o memento ao Caretaker. `UndoPatientUpdateCommand` pega o memento do topo, pede ao Originator que o restaure e só então o remove. Sem memento, lança `NoUpdateToUndoError` (`NO_UPDATE_TO_UNDO`). A fachada expõe `undoPatientUpdate` e `canUndoPatientUpdate`, com a permissão `MANAGE_PATIENTS`.

O memento guarda apenas os dados que a edição substitui; situação, autor e id ficam fora. A restauração não revalida as regras de RF11, porque os dados já foram validados quando foram salvos, mas o repositório continua recusando um CPF que passou a ser de outro paciente.

## Consequências

- Edições recusadas não entram no histórico.
- Edições sucessivas são desfeitas uma por vez; desfazer não cria nova entrada, então não existe refazer.
- Se a restauração falhar, o memento continua na pilha e o usuário pode tentar de novo.
- O histórico fica na memória do processo, dentro da instância única da fachada, nos dois mecanismos de `STORAGE`. Reiniciar o servidor apaga o histórico, não os dados. Em execução com várias instâncias (por exemplo, serverless), cada instância tem o seu histórico.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Tabela de histórico no banco | Mais robusto, mas exige migração e não é pedido na Sprint 5; pode ser feito depois mantendo o Caretaker como interface |
| Undo dentro do próprio comando (Command com `undo`) | Guardaria o estado no comando; o enunciado pede Memento como forma de guardar o estado |
| Um único memento global | "A última alteração" de um paciente seria apagada pela edição de outro paciente feita por outra pessoa |
