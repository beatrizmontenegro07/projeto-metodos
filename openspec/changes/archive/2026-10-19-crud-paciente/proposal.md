# Proposta: cadastro de pacientes e fachada única

## Why

O Paciente é a entidade central do CRM ([glossário](../../../docs/02-glossario.md)), mas hoje só existe na visão (RF01). A Sprint 3 pede o CRUD de uma entidade relacionada a Usuário e uma fachada única (Facade + Singleton) para os controles, com um método que informa quantas entidades estão cadastradas ([cronograma](../../../docs/00-entregas.md)).

## What Changes

- Cadastro de pacientes (UC01) pelo Recepcionista ou pelo Administrador, com nome, CPF único, data de nascimento, sexo, telefone, e-mail e endereço opcionais e a base legal da LGPD; o paciente fica vinculado ao usuário que o cadastrou.
- Regras de validação dos dados do paciente, com uma mensagem específica para cada caso.
- Edição (UC07), inativação e reativação (UC08) e busca por nome ou CPF com filtro de situação (UC09). Não há exclusão: um paciente inativo continua no histórico.
- Página inicial com a quantidade de usuários e de pacientes cadastrados (UC10).
- Rotas `/api/patients` e telas TL03 e TL04.
- `FacadeSingletonController`: ponto único de entrada da camada de negócio para as telas e as rotas.

## Capabilities

### New Capabilities

- `pacientes`: cadastro, regras dos dados, edição, inativação, reativação e busca de pacientes.
- `painel`: totais de entidades cadastradas exibidos na página inicial.

### Modified Capabilities

Nenhuma. O acesso por papel aos pacientes segue o NF-SEG-02, alterado pela change `autenticacao`.

## Impact

- Código: novo módulo `src/modules/patients/`, repositórios em `src/infra/patients/`, tabela `patients` com migração, fachada em `src/modules/facade/`, rotas `src/app/api/patients/` e páginas `src/app/[locale]/patients/`.
- As rotas `/api/users` passam a chamar a fachada em vez do `UserController`.
- Decisão registrada no ADR-0007 (fachada única).
- Depende da change `autenticacao` (usuário autenticado e permissões).

## Fora do escopo

- Exclusão definitiva de pacientes, exportação e importação no formato FHIR (NF-INT-01) e pseudonimização de relatórios.
- Desfazer a última alteração do paciente (Sprint 5).
- Agendamentos, atendimentos e comunicações ligados ao paciente.
- Paginação no servidor: a listagem filtra no servidor e pagina na tela.
