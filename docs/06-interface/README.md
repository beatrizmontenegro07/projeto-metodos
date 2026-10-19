# Descrição da interface com o usuário

> Seção 8 do modelo. Rascunhos (wireframes) das telas que ajudam a entender os requisitos.
> Cada tela tem um ID (TLnn) citado nos casos de uso. As telas usam os componentes e blocos do [shadcn/ui](https://ui.shadcn.com) (login em duas colunas, menu lateral, tabela de dados, diálogos) e seguem os protótipos do [documento de requisitos](../relatorio/images/mockups-interface.png): menu lateral à esquerda, barra no topo e conteúdo à direita. Os textos aparecem no idioma do usuário ([ADR-0005](../07-arquitetura/adr/0005-ingles-no-codigo-e-i18n.md)).

| Tela | Rota | Casos de uso | Situação |
|---|---|---|---|
| TL01 Cadastro de usuário | `/users/new` | UC05 | Implementada |
| TL02 Listagem de usuários | `/users` | UC06 | Implementada |
| TL03 Lista de pacientes | `/patients` | UC08, UC09 | Implementada |
| TL04 Cadastro e edição de paciente | `/patients/new`, `/patients/<id>` | UC01, UC07, UC08 | Implementada |
| TL05 Login | `/login` | UC04 | Implementada |
| TL06 Primeiro administrador | `/setup` | UC05 (RF16) | Implementada |
| TL07 Início | `/` | UC10 | Implementada |

**Menu e barra do topo (todas as telas, exceto TL05 e TL06):** o menu lateral mostra só as áreas do papel do usuário (NF-SEG-02): "Início" para todos, "Pacientes" para Administrador e Recepcionista, "Usuários" só para o Administrador. No rodapé do menu ficam o nome e o papel do usuário e a opção "Sair". A barra do topo tem o botão que recolhe o menu, o caminho da página (breadcrumb) e a escolha do idioma. Quem abre uma tela fora do seu papel vê "Acesso negado — Seu papel não permite abrir esta página.", sem nenhum dado.

## TL01 — Cadastro de usuário

Relacionada a: UC05 · RF07, RF08, RF09, NF-SEG-01

```text
┌──────────────┬───────────────────────────────────────────────────────────┐
│ CliniCore    │ ☰ │ Usuários › Novo usuário                  文A Português │
│              ├───────────────────────────────────────────────────────────┤
│ Menu         │ Novo usuário                                              │
│ ⌂ Início     │ O usuário entra com o login ou o e-mail e esta senha.     │
│ ☺ Pacientes  │                                                           │
│ ⛨ Usuários ◄ │ Nome completo [ Ana Silva                             ]   │
│              │ E-mail        [ ana@clinicore.com                     ]   │
│              │ Login         [ ana1                                  ]   │
│              │ ⚠ O login não pode conter números.                        │
│              │ Senha         [ ••••••••••                         👁 ]   │
│              │ De 8 a 128 caracteres, com três destes tipos: …           │
│              │ Papel         [ Recepcionista                        ▾ ]  │
│              │                                                           │
│ CS Carla     │                              [ Cancelar ]  [ Cadastrar ]  │
└──────────────┴───────────────────────────────────────────────────────────┘
```

- O papel é escolhido numa lista com os quatro papéis (Administrador, Recepcionista, Médico, Paciente).
- Uma recusa mostra, junto do campo, a mensagem da regra violada (RF07–RF09) e mantém os campos preenchidos, exceto a senha, que nunca volta para a tela (NF-SEG-01). O botão do olho mostra ou esconde a senha digitada.
- Após o cadastro, a tela volta para a TL02 com o novo usuário no fim da lista.

## TL02 — Listagem de usuários

Relacionada a: UC06 · RF10, NF-SEG-01

```text
┌──────────────┬────────────────────────────────────────────────────────────────┐
│ CliniCore    │ ☰ │ Usuários                                      文A Português │
│              ├────────────────────────────────────────────────────────────────┤
│ Menu         │ Usuários                                    [ + Novo usuário ] │
│ ⌂ Início     │ Quem pode entrar no CliniCore, em ordem de cadastro.           │
│ ☺ Pacientes  │                                                                │
│ ⛨ Usuários ◄ │ #  Nome completo   E-mail               Login  Papel           │
│              │ 1  Carla Souza     carla@clinicore.com  carla  (Administrador) │
│              │ 2  Ana Silva       ana@clinicore.com    ana    (Recepcionista) │
│              │                                                                │
│              │ (sem usuários: "Nenhum usuário cadastrado.")                   │
└──────────────┴────────────────────────────────────────────────────────────────┘
```

- Ordem de cadastro, sem coluna de senha (RF10). O papel aparece como etiqueta.
- "+ Novo usuário" abre a TL01. O menu "Usuários" só aparece para o Administrador (NF-SEG-02).

## TL03 — Lista de pacientes

Relacionada a: UC09, UC08 · RF13, RF14, NF-DES-01

```text
┌──────────────┬──────────────────────────────────────────────────────────────────────────────────┐
│ CliniCore    │ ☰ │ Pacientes                                                     文A Português │
│              ├──────────────────────────────────────────────────────────────────────────────────┤
│ Menu         │ Pacientes                                                    [ + Novo paciente ] │
│ ⌂ Início     │ Busque pelo nome ou CPF e filtre pela situação.                                  │
│ ☺ Pacientes ◄│                                                                                  │
│ ⛨ Usuários   │ [🔍 Buscar por nome ou CPF…   ] [ Todas as situações ▾ ] [ Buscar ]              │
│              │                                                                                  │
│              │ Nome completo ⇅    CPF             Telefone         Data de nascimento ⇅ Situação│
│              │ Álvaro Dias        987.654.321-00  (83) 3222-1100   05/01/1975          (Ativo)  │
│              │                                                     [✎ Editar] [⊘ Inativar]      │
│              │ Joana Souza Lima   123.456.789-09  (83) 98765-4321  12/03/1985          (Inativo)│
│              │                                                     [✎ Editar] [✓ Reativar]      │
│              │                                                                                  │
│              │ Mostrando 2 de 2 pacientes                Página 1 de 1  [ Anterior ] [ Próxima ]│
└──────────────┴──────────────────────────────────────────────────────────────────────────────────┘
```

- A busca encontra parte do nome, sem diferenciar maiúsculas, minúsculas e acentos ("joao" encontra "João"), ou parte do CPF, com ou sem pontuação. O filtro mostra todas as situações, só os ativos ou só os inativos. A busca e o filtro ficam no endereço (`/patients?search=joao&status=active`), então o resultado pode ser compartilhado.
- A lista vem em ordem alfabética do nome; as colunas "Nome completo" e "Data de nascimento" podem ser reordenadas. A tabela mostra 10 pacientes por página.
- O nome e "Editar" abrem o paciente na TL04. "Inativar" pede confirmação; "Reativar" não pede (UC08).
- Sem resultados, a tela mostra "Nenhum paciente encontrado." e sugere mudar a busca ou cadastrar um novo paciente.

## TL04 — Cadastro e edição de paciente

Relacionada a: UC01, UC07, UC08 · RF01, RF11, RF12, RF13, NF-PRI-01

```text
┌──────────────┬──────────────────────────────────────────────────────────────────┐
│ CliniCore    │ ☰ │ Pacientes › Joana Souza Lima                  文A Português │
│              ├──────────────────────────────────────────────────────────────────┤
│ Menu         │ Joana Souza Lima (Ativo)                          [⊘ Inativar]  │
│ ⌂ Início     │ Cadastrado por Ana Silva                                         │
│ ☺ Pacientes ◄│ ✓ Alterações salvas.                                             │
│ ⛨ Usuários   │                                                                  │
│              │ Nome completo [ Joana Souza Lima                              ]  │
│              │ CPF           [ 123.456.789-09 ]  Data de nascimento [12/03/1985]│
│              │ ⚠ Já existe um paciente cadastrado com este CPF.                 │
│              │ Ver paciente                                                     │
│              │ Sexo          [ Feminino     ▾ ]  Telefone [ (83) 98765-4321 ]   │
│              │ E-mail        [               ]   Endereço [                 ]   │
│              │ Opcional.                         Opcional.                      │
│              │ Base legal (LGPD) [ Tutela da saúde                          ▾ ] │
│              │ Por que a clínica pode tratar os dados deste paciente.           │
│              │                                                                  │
│              │                                       [ Cancelar ]  [ Salvar ]   │
└──────────────┴──────────────────────────────────────────────────────────────────┘
```

- No cadastro (`/patients/new`), o título é "Novo paciente", a tela abre vazia, sem a situação, sem "Cadastrado por" e sem "Inativar", e o botão é "Cadastrar". Depois do cadastro, a tela abre o paciente criado com "Paciente cadastrado.".
- Sexo e base legal são escolhidos em listas: Masculino, Feminino, Outro e Desconhecido; Consentimento do titular, Tutela da saúde, Cumprimento de obrigação legal e Proteção da vida.
- Uma recusa mostra, junto do campo, a mensagem da regra violada (RF11) e mantém os valores digitados. Com CPF já cadastrado, o atalho "Ver paciente" abre o registro que já tem esse CPF (UC01 FE2).
- "Inativar" abre um diálogo de confirmação ("Inativar Joana Souza Lima?"). Um paciente inativo mostra a etiqueta "Inativo" e o botão "Reativar" (UC08).
- "Desfazer última alteração" volta os dados do paciente para o estado anterior à última edição; entra nesta tela na Sprint 5 e ainda não existe.

## TL05 — Login

Relacionada a: UC04 · RF06, NF-SEG-02

```text
            ┌──────────────────────────────────┬──────────────────────────────┐
            │       Bem-vindo de volta         │ ♥ CliniCore                  │
            │  Entre com seu login ou e-mail.  │                              │
            │                                  │                              │
            │ ⚠ Login ou senha incorretos.     │                              │
            │ Login ou e-mail                  │                              │
            │ [ carla                        ] │ CRM ambulatorial para        │
            │ Senha                            │ clínicas.                    │
            │ [ ••••••••••                👁 ] │ Pacientes, agenda e          │
            │                                  │ comunicação num só lugar, …  │
            │ [            Entrar            ] │                              │
            └──────────────────────────────────┴──────────────────────────────┘
                              Português   English
```

- Cartão em duas colunas (bloco login-04 do shadcn/ui): o formulário à esquerda e o painel do CliniCore à direita, que some em telas estreitas.
- Login ou e-mail (o e-mail sem diferenciar maiúsculas) e senha, com o botão do olho. Credenciais erradas mostram sempre "Login ou senha incorretos.", sem dizer se o login existe.
- Sem usuários cadastrados, a tela leva à TL06. Quem já está com a sessão aberta vai para a TL07.
- Os links "Português" e "English" trocam o idioma de todas as telas.

## TL06 — Primeiro administrador

Relacionada a: UC05 (RF16)

```text
            ┌──────────────────────────────────┬──────────────────────────────┐
            │  Crie o primeiro administrador   │ ♥ CliniCore                  │
            │ Ainda não há usuários. Esta conta│                              │
            │ vai gerenciar usuários e         │                              │
            │ pacientes.                       │                              │
            │ Nome completo  [               ] │ CRM ambulatorial para        │
            │ E-mail         [               ] │ clínicas.                    │
            │ Login          [               ] │                              │
            │ Até 12 caracteres, sem números.  │                              │
            │ Senha          [            👁 ] │                              │
            │ [       Criar administrador    ] │                              │
            └──────────────────────────────────┴──────────────────────────────┘
                              Português   English
```

- Só abre enquanto não há usuários; depois, leva à TL05. O usuário criado tem o papel Administrador, a sessão dele é aberta e a tela seguinte é a TL07.
- As regras e as mensagens de login e senha são as mesmas da TL01.

## TL07 — Início

Relacionada a: UC10 · RF15, NF-USA-01

```text
┌──────────────┬──────────────────────────────────────────────────────────────┐
│ CliniCore    │ ☰ │ Início                                    文A Português │
│              ├──────────────────────────────────────────────────────────────┤
│ Menu         │ Olá, Carla Souza                                             │
│ ⌂ Início   ◄ │ O que está cadastrado no CliniCore agora.                    │
│ ☺ Pacientes  │                                                              │
│ ⛨ Usuários   │ ┌ Pacientes        ☺ ┐  ┌ Usuários         ⛨ ┐                │
│              │ │ 5                  │  │ 3                  │                │
│              │ │ Ativos e inativos  │  │ Todos os papéis    │                │
│              │ └────────────────────┘  └────────────────────┘                │
│              │                                                              │
│              │ [ + Novo paciente ]  [ ⛨ Novo usuário ]                      │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

- Os cartões mostram só os totais das áreas do papel (RF15): o Administrador vê pacientes e usuários; o Recepcionista, só pacientes; o Médico e o Paciente veem "Seu papel ainda não tem cadastros para mostrar aqui.".
- Os atalhos levam às tarefas mais comuns do papel em um clique (NF-USA-01): "Novo paciente" para Administrador e Recepcionista, "Novo usuário" para o Administrador.
