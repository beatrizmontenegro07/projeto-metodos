# Tarefas: cadastro de pacientes e fachada única

## 1. Regras do paciente

- [ ] 1.1 Criar `Patient`, `Gender`, `LegalBasis`, as regras de RF11 e as exceções por campo em `src/modules/patients/`; verificar um teste por cenário de RF11
- [ ] 1.2 Criar `PatientRepository` e `PatientController` (cadastrar, editar, inativar, reativar, consultar, buscar, contar); verificar com testes do controle sobre um repositório de teste
- [ ] 1.3 Adicionar as mensagens `patients.errors.*` em pt-BR e en; verificar com o teste dos catálogos

## 2. Armazenamento

- [ ] 2.1 Criar a tabela `patients` em `schema.ts` e gerar a migração com `npm run db:generate`; verificar com `npm run db:migrate` num arquivo novo
- [ ] 2.2 Criar `InMemoryPatientRepository`, `SqlitePatientRepository` e a fábrica por `STORAGE`; verificar com os testes de contrato nas duas implementações

## 3. Fachada única

- [ ] 3.1 Criar `FacadeSingletonController` com `countRegisteredEntities` e a verificação de permissão; verificar que duas chamadas a `getInstance` devolvem a mesma instância e os cenários de RF15
- [ ] 3.2 Fazer `/api/users` chamar a fachada e registrar o ADR-0007; verificar os testes das rotas de usuários

## 4. Rotas de pacientes

- [ ] 4.1 Criar `/api/patients` e `/api/patients/{id}`; verificar com testes das rotas para cada status de resposta

## 5. Telas

- [ ] 5.1 Criar a página inicial com os totais (RF15); verificar manualmente com Administrador e Recepcionista
- [ ] 5.2 Criar TL03 (`/patients`) com busca, filtro e paginação; verificar manualmente os cenários de RF14
- [ ] 5.3 Criar TL04 (`/patients/new`, `/patients/{id}`) com edição, inativação e reativação; verificar manualmente os cenários de RF01, RF11, RF12 e RF13 nos dois idiomas

## 6. Documentação da entrega

- [ ] 6.1 Atualizar o diagrama de casos de uso completo e detalhar UC01, UC07 e UC05 em `docs/04-casos-de-uso/`; verificar a rastreabilidade com os RFs
- [ ] 6.2 Atualizar `docs/05-analise.md`, `docs/08-projeto.md` (classes de projeto e padrões Singleton e Facade), `docs/06-interface/` e `docs/07-arquitetura/`; verificar que os nomes batem com o código

## Workflow follow-up

- Arquivar a change com `openspec archive crud-paciente` depois do merge das tarefas (S3.3).
