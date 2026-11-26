# Projeto

## Command (S5.1)
`Command<Result>` declara `execute()`. Cada método de `FacadeSingletonController` cria um comando concreto ligado ao seu receptor e aos argumentos da chamada e o entrega a `CommandInvoker.execute`. Os receptores são os controles já existentes (`UserController`, `AuthenticationController`, `PatientController`) e o Template Method dos relatórios. A fachada continua Singleton e continua verificando o papel (NF-SEG-02) antes de criar o comando, de modo que um papel sem permissão não chega a executar nada. As telas, Server Actions e rotas de API continuam chamando só a fachada.

## Memento (S5.2)
- Originator: `PatientController`, com `createMemento(id)` e `restore(memento)`.
- Memento: `PatientMemento`, cópia congelada (`Object.freeze`) dos dados que a edição substitui (nome, CPF, nascimento, sexo, telefone, e-mail, endereço e base legal). A situação e o autor não entram, porque a edição não os altera.
- Caretaker: `PatientUpdateHistory`, uma pilha de mementos por paciente, guardada na fachada.

`UpdatePatientCommand` cria o memento, executa a edição e só depois de ela ser aceita empilha o memento; uma edição recusada não deixa nada para desfazer. `UndoPatientUpdateCommand` lê o memento do topo, restaura os dados e só então o remove; se a restauração falhar (por exemplo, o CPF antigo passou a ser de outro paciente), o memento continua disponível. Sem memento, a operação lança `NoUpdateToUndoError` (`NO_UPDATE_TO_UNDO`).

O histórico vive na instância única da fachada, na memória do processo, para os dois mecanismos de `STORAGE`. Reiniciar o servidor apaga o histórico, mas não os dados.

## Fronteiras
A tela `/patients/{id}` mostra "Desfazer última alteração" quando `canUndoPatientUpdate` é verdadeiro; a Server Action `undoPatientUpdate` reabre a tela com "Última alteração desfeita.". A API `POST /api/patients/{id}/undo` responde 200 com o paciente restaurado, 409 `NO_UPDATE_TO_UNDO`, 404, 403 ou 401.
