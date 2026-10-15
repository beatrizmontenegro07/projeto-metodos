# ADR-0005: Escrever o código em inglês e traduzir a interface com i18n

- **Status:** aceito
- **Data:** 2026-10-14
- **Requisitos relacionados:** NF-USA-01

## Contexto

O código misturava português (domínio, rotas como `/api/usuarios`) com inglês (framework e bibliotecas), e os textos de tela e as mensagens de erro ficavam fixos em português dentro do código. Isso impede oferecer a interface em mais de um idioma e obriga cada revisão a discutir nomes caso a caso.

## Decisão

Todo o código é escrito em inglês: arquivos e pastas, identificadores, tabelas e colunas do banco, valores de enumeração, rotas e nomes de testes. O texto exibido ao usuário vem dos catálogos do **next-intl** em `messages/`: `en.json` é a fonte e `pt-BR` é o idioma padrão.

As URLs não têm idioma (`/patients`, `/api/users`). O proxy escolhe o idioma pelo cookie `NEXT_LOCALE`, depois pelo idioma do navegador e, por fim, `pt-BR`, e reescreve a requisição internamente para `app/[locale]` (`localePrefix: "never"` do next-intl). Assim as páginas continuam pré-renderizadas por idioma. Visitar `/en` ou `/pt-BR` grava a escolha no cookie e redireciona para `/`. Erros de domínio carregam um código estável (`INVALID_LOGIN`), traduzido pela interface a partir de `<capacidade>.errors.<código>`.

Os documentos da disciplina (requisitos, casos de uso, diagramas) continuam em português. A correspondência com o código:

| Termo nos documentos | Nome no código |
|---|---|
| Usuário | `User` (tabela `users`) |
| Papel: Administrador, Recepcionista, Médico, Paciente | `Role`: `ADMIN`, `RECEPTIONIST`, `DOCTOR`, `PATIENT` |
| Login | `login` |
| Senha | `password` (coluna `password_hash`) |
| ControladorDeUsuarios | `UserController` |
| ErroDeValidacaoDeUsuario, ErroDePersistenciaDeUsuarios | `UserValidationError`, `UserPersistenceError` |
| Paciente, Profissional | `Patient`, `Practitioner` (nomes dos recursos HL7 FHIR R4) |

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Código em português, seguindo o glossário | Mistura com os nomes do framework e das bibliotecas; rotas e textos em português não atendem a um segundo idioma |
| Idioma no início da URL (`/pt-BR/patients`) | Polui as rotas sem benefício: o sistema fica atrás de login e não precisa de URLs por idioma para buscadores |
| Ler o cookie de idioma no layout raiz | Impede a pré-renderização com `cacheComponents`: toda página passaria a ser gerada a cada requisição. Com a reescrita no proxy, o layout recebe o idioma pelo parâmetro de rota |
| Textos fixos em português | Impede um segundo idioma e acopla as mensagens de erro ao domínio |

## Consequências

- Positivas: um único idioma no código; páginas pré-renderizadas por idioma; um teste garante que todos os catálogos têm as mesmas chaves e que todo código de erro e papel tem tradução.
- Negativas / riscos: diagramas e casos de uso precisam da tabela de correspondência acima; a troca de idioma depende de cookie, não da URL; toda tela nova exige a chave em todos os catálogos.
