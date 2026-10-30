# UC07 — Editar paciente

[← Casos de uso](README.md)

| Campo | Descrição |
|---|---|
| **Identificador** | UC07 |
| **Importância** | Essencial |
| **Sumário** | Permite corrigir ou atualizar os dados de um paciente já cadastrado, mantendo a situação (ativo ou inativo) e o usuário que o cadastrou. |
| **Atores** | Recepcionista, Administrador |
| **Pré-condições** | O ator está autenticado (UC04) com o papel Recepcionista ou Administrador, e o paciente existe. |
| **Fluxo principal** | 1. O ator busca o paciente (UC09) e escolhe o nome dele ou "Editar" na lista (TL03).<br>2. O sistema exibe o registro do paciente (TL04): nome, situação (Ativo ou Inativo), "Cadastrado por" com o nome do usuário, e o formulário preenchido, com o CPF e o telefone formatados.<br>3. O ator altera os campos desejados.<br>4. O ator escolhe "Salvar".<br>5. O sistema valida os dados pelas regras do RF11.<br>6. O sistema substitui os dados do paciente; a situação e o "cadastrado por" não mudam.<br>7. O sistema exibe o registro atualizado e informa "Alterações salvas.". |
| **Fluxos alternativos** | FA1 — Remover dados opcionais (passo 3): se o ator apaga o e-mail ou o endereço, o paciente fica sem eles.<br>FA2 — Inativar ou reativar (UC08, passo 2): o ator escolhe "Inativar"; o sistema pede confirmação ("Inativar <nome>?" — "O paciente mantém todos os dados e pode ser reativado depois."); ao confirmar, a situação passa a Inativo e o botão vira "Reativar". "Reativar" volta a situação para Ativo sem pedir confirmação. Os dados não mudam.<br>FA3 — Cancelar (passo 4): o ator escolhe "Cancelar" e volta à lista de pacientes sem salvar. |
| **Fluxos de exceção** | FE1 — Dado inválido (passo 5): o sistema mostra, junto do campo, a mensagem da primeira regra violada (por exemplo, "Informe o nome do paciente." ou "O CPF deve ter 11 dígitos."), mantém os valores digitados e volta ao passo 3.<br>FE2 — CPF de outro paciente (passo 6): "Já existe um paciente cadastrado com este CPF.", com o atalho "Ver paciente" para o registro que já tem esse CPF; nada é alterado. O CPF do próprio paciente é aceito.<br>FE3 — Paciente inexistente (passo 2): um endereço `/patients/<id>` que não corresponde a nenhum paciente exibe a página de não encontrado; se o paciente deixar de existir antes de salvar, o sistema informa "Paciente não encontrado.".<br>FE4 — Papel sem permissão (passo 1): para o Médico e o Paciente, a página exibe "Acesso negado — Seu papel não permite abrir esta página."; pela API, `PUT /api/patients/<id>` responde 403.<br>FE5 — Falha do armazenamento (passo 6): "Não foi possível acessar os dados agora. Tente novamente." (NF-CON-01). |
| **Pós-condição** | Os dados do paciente ficam atualizados na busca (UC09); a situação e o vínculo com o usuário que o cadastrou permanecem os mesmos. |
| **Requisitos** | RF11, RF12, RF13 (FA2), NF-SEG-02, NF-CON-01 ([`specs/pacientes`](../../openspec/specs/pacientes/spec.md)) |
| **Telas** | TL03 Lista de pacientes, TL04 Cadastro e edição de paciente ([interface](../06-interface/README.md)) |

"Desfazer a última alteração" do paciente é o requisito da Sprint 5 (padrão Memento) e ainda não existe; quando for implementado, entra como fluxo alternativo deste caso de uso.

**No código:** a página `src/app/[locale]/(app)/patients/[id]/page.tsx` envia o formulário à Server Action `updatePatient`, que chama `FacadeSingletonController.updatePatient`; a fachada verifica a permissão `MANAGE_PATIENTS` e delega a `PatientController.update`. A inativação e a reativação usam `setPatientActive` → `deactivatePatient` / `reactivatePatient`. As mesmas operações estão em `PUT` e `PATCH /api/patients/<id>`.
