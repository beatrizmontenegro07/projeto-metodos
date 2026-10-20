# UC01 — Cadastrar paciente

[← Casos de uso](README.md)

| Campo | Descrição |
|---|---|
| **Identificador** | UC01 |
| **Importância** | Essencial |
| **Sumário** | Permite criar o registro de um paciente, a pessoa que recebe ou receberá cuidados na clínica, vinculado ao usuário que o cadastrou. |
| **Atores** | Recepcionista, Administrador |
| **Pré-condições** | O ator está autenticado (UC04) com o papel Recepcionista ou Administrador. Sem sessão, o sistema leva à tela de login. |
| **Fluxo principal** | 1. O ator escolhe "Novo paciente" na lista de pacientes (TL03) ou na página inicial (TL07).<br>2. O sistema exibe o formulário de cadastro vazio (TL04).<br>3. O ator informa nome completo, CPF, data de nascimento, sexo, telefone e base legal (LGPD) e, se quiser, e-mail e endereço.<br>4. O ator escolhe "Cadastrar".<br>5. O sistema valida os dados pelas regras do RF11, na ordem dos campos.<br>6. O sistema grava o paciente como ativo, com um identificador único, o CPF e o telefone só com dígitos, e vinculado ao ator ("cadastrado por").<br>7. O sistema abre o registro do novo paciente (TL04) e informa "Paciente cadastrado.". |
| **Fluxos alternativos** | FA1 — Campos opcionais em branco (passo 3): sem e-mail ou endereço, o paciente é gravado sem eles.<br>FA2 — Cancelar (passo 4): o ator escolhe "Cancelar" e volta à lista de pacientes sem gravar nada. |
| **Fluxos de exceção** | FE1 — Dado inválido (passo 5): o sistema mostra, junto do campo, a mensagem da primeira regra violada (por exemplo, "O CPF informado é inválido.", "O telefone deve ter DDD e 8 ou 9 dígitos.", "A data de nascimento não pode estar no futuro." ou "Informe a base legal do tratamento dos dados."), mantém os valores digitados e volta ao passo 3.<br>FE2 — CPF já cadastrado (passo 6), inclusive de um paciente inativo ou em cadastros simultâneos: o sistema informa "Já existe um paciente cadastrado com este CPF." junto do CPF e oferece o atalho "Ver paciente", que abre o registro existente; nada é gravado.<br>FE3 — Papel sem permissão (passo 1): para o Médico e o Paciente, o menu não mostra "Pacientes" e o endereço `/patients/new` exibe "Acesso negado — Seu papel não permite abrir esta página."; uma tentativa direta pela fachada ou pela API é recusada com "Seu papel não permite esta operação.".<br>FE4 — Falha do armazenamento (passo 6): o sistema informa "Não foi possível acessar os dados agora. Tente novamente." e mantém os valores digitados (NF-CON-01). |
| **Pós-condição** | Um paciente ativo fica gravado, vinculado ao usuário que o cadastrou, e passa a aparecer na busca (UC09) e no total de pacientes da página inicial (UC10). |
| **Requisitos** | RF01, RF11, NF-PRI-01, NF-SEG-02, NF-CON-01 ([`specs/pacientes`](../../openspec/specs/pacientes/spec.md)) |
| **Telas** | TL03 Lista de pacientes, TL04 Cadastro e edição de paciente ([interface](../06-interface/README.md)) |

**No código:** a página `src/app/[locale]/(app)/patients/new/page.tsx` envia o formulário à Server Action `addPatient`, que chama `FacadeSingletonController.addPatient`; a fachada verifica a permissão `MANAGE_PATIENTS` e delega a `PatientController.add`, que valida (`src/modules/patients/rules.ts`) e grava pelo `PatientRepository`. A mesma operação está em `POST /api/patients`.
