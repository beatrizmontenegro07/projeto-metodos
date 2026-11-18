## 1. Command na fachada
- [x] 1.1 Criar `Command`, `CommandInvoker` e um comando concreto por operação da fachada.
- [x] 1.2 Fazer a fachada criar e executar os comandos, mantendo Singleton e verificação de papel.
- [x] 1.3 Testar o Invoker e o encaminhamento das operações pela fachada.

## 2. Memento para desfazer a última atualização
- [x] 2.1 Especificar RF19 com cenários.
- [x] 2.2 Criar `PatientMemento` e `PatientUpdateHistory`; `PatientController` como Originator.
- [x] 2.3 Integrar o memento a `UpdatePatientCommand` e criar `UndoPatientUpdateCommand`.
- [x] 2.4 Expor na fachada, na tela do paciente e em `POST /api/patients/{id}/undo`.
- [x] 2.5 Testar desfazer, pilha por paciente, edição recusada, CPF em conflito e permissão.

## 3. Documentação
- [x] 3.1 ADR-0012 (fachada com Command) e ADR-0013 (Memento).
- [x] 3.2 Atualizar diagrama de classes de projeto, tabela de padrões, UC07 e TL04.
