# Descrição da interface com o usuário

> Seção 8 do modelo. Rascunhos (wireframes) das telas que ajudam a entender os requisitos.
> Cada tela tem um ID (TLnn) citado nos casos de uso. O visual final segue os protótipos do [documento de requisitos](../relatorio/images/mockups-interface.png): menu lateral à esquerda, busca no topo e conteúdo à direita. Os textos aparecem no idioma do usuário ([ADR-0005](../07-arquitetura/adr/0005-ingles-no-codigo-e-i18n.md)).

| Tela | Rota | Casos de uso | Situação |
|---|---|---|---|
| TL01 Cadastro de usuário | `/users/new` | UC05 | Regras implementadas; tela planejada |
| TL02 Listagem de usuários | `/users` | UC06 | Regras implementadas; tela planejada |
| TL03 Lista de pacientes | `/patients` | Cadastrar paciente, Editar paciente | Rascunho: depende da change `crud-paciente` |
| TL04 Cadastro e edição de paciente | `/patients/new`, `/patients/<id>` | Cadastrar paciente, Editar paciente | Rascunho: depende da change `crud-paciente` |

## TL01 — Cadastro de usuário

Relacionada a: UC05 · RF07, RF08, RF09, NF-SEG-01

```text
┌────────────┬───────────────────────────────────────────────────────┐
│ CliniCore  │ Usuários › Novo usuário                               │
│            ├───────────────────────────────────────────────────────┤
│ Início     │ Nome    [ Ana Silva                              ]    │
│ Pacientes  │ E-mail  [ ana@clinicore.com                      ]    │
│ Usuários ◄ │ Login   [ ana          ]  até 12 letras, sem números  │
│            │ Senha   [ ••••••••••   ]  8 a 128 caracteres, com 3   │
│            │                           tipos (Aa, 1, @)            │
│            │ Papel   [ Recepcionista                        ▾ ]    │
│            │                                                       │
│            │ ⚠ O login não pode ser vazio, ter números ou mais     │
│            │   de 12 caracteres.                                   │
│            │                         [ Cancelar ]  [ Cadastrar ]   │
└────────────┴───────────────────────────────────────────────────────┘
```

- O papel é escolhido numa lista com os quatro papéis (Administrador, Recepcionista, Médico, Paciente).
- Uma recusa mostra a mensagem da regra violada (RF07–RF09) e mantém os campos preenchidos, exceto a senha, que nunca é repetida na tela (NF-SEG-01).
- Após o cadastro, a tela volta para a TL02 com o novo usuário no fim da lista.

## TL02 — Listagem de usuários

Relacionada a: UC06 · RF10, NF-SEG-01

```text
┌────────────┬────────────────────────────────────────────────────────────────┐
│ CliniCore  │ Usuários                          [ + Novo usuário ]           │
│            ├────────────────────────────────────────────────────────────────┤
│ Início     │ #   Nome             E-mail              Login  Papel          │
│ Pacientes  │ 1   Ana Silva        ana@clinicore.com   ana    Recepcionista  │
│ Usuários ◄ │ 2   Dr. Bruno Lima   bruno@clinicore.com bruno  Médico         │
│            │                                                                │
│            │ (sem usuários: "Nenhum usuário cadastrado.")                   │
└────────────┴────────────────────────────────────────────────────────────────┘
```

- Ordem de cadastro, sem coluna de senha (RF10).
- "+ Novo usuário" abre a TL01. O menu "Usuários" só aparece para o Administrador (UC04 / NF-SEG-02).

## TL03 — Lista de pacientes

Relacionada a: Cadastrar paciente, Editar paciente · NF-DES-01

```text
┌────────────┬──────────────────────────────────────────────────────────────────────────┐
│ CliniCore  │ Pacientes                        [ + Novo paciente ]                     │
│            ├──────────────────────────────────────────────────────────────────────────┤
│ Início     │ [ Buscar por nome ou CPF...       ] [ Todos os status ▾ ]                │
│ Pacientes ◄│                                                                          │
│ Usuários   │ Nome               CPF             Telefone        Nascimento  Status    │
│            │ Ana Souza Silva    123.456.789-09  (83) 98765-4321 12/03/1985  Ativo    ›│
│            │ Bruno F. Lima      987.654.321-00  (83) 91234-5678 22/07/1990  Inativo  ›│
│            │                                                                          │
│            │ Mostrando 2 de 2 pacientes                                               │
└────────────┴──────────────────────────────────────────────────────────────────────────┘
```

- A busca filtra por nome ou CPF; o filtro de status mostra Ativos, Inativos ou Todos.
- "›" abre o paciente na TL04; "+ Novo paciente" abre a TL04 vazia.

## TL04 — Cadastro e edição de paciente

Relacionada a: Cadastrar paciente, Editar paciente

```text
┌────────────┬────────────────────────────────────────────────────────┐
│ CliniCore  │ Pacientes › Ana Souza Silva                [Ativo]     │
│            ├────────────────────────────────────────────────────────┤
│ Início     │ Nome completo    [ Ana Souza Silva                ]    │
│ Pacientes ◄│ CPF              [ 123.456.789-09 ]                    │
│ Usuários   │ Nascimento       [ 12/03/1985 ]  Sexo [ Feminino ▾]    │
│            │ Telefone         [ (83) 98765-4321 ]                   │
│            │ Endereço         [ Rua das Flores, 100 — João Pessoa]  │
│            │                                                        │
│            │ ⚠ Já existe um paciente com este CPF. [Ver paciente]   │
│            │                                                        │
│            │ [ Inativar ] [ Desfazer última alteração ]             │
│            │                         [ Cancelar ]  [ Salvar ]       │
└────────────┴────────────────────────────────────────────────────────┘
```

- No cadastro, a tela abre vazia e sem os botões "Inativar" e "Desfazer última alteração".
- CPF inválido ou já cadastrado impede salvar; no segundo caso, o aviso leva ao perfil do paciente existente.
- "Desfazer última alteração" volta os dados do paciente para o estado anterior à última edição (Sprint 5).
- Os campos e as mensagens finais serão definidos na change `crud-paciente`, e então esta tela será revisada.
