# ADR-0005: Escrever o código em inglês e traduzir a interface com i18n

- **Status:** proposto
- **Data:** 2026-10-14
- **Requisitos relacionados:** NF01

## Contexto

O código misturava português (domínio, rotas como `/api/usuarios`) com inglês (framework e bibliotecas), e os textos de tela e as mensagens de erro ficavam fixos em português dentro do código. Isso impede oferecer a interface em mais de um idioma e obriga cada revisão a discutir nomes caso a caso.

## Decisão

Todo o código é escrito em inglês: arquivos e pastas, identificadores, tabelas e colunas do banco, valores de enumeração, rotas e nomes de testes. O texto exibido ao usuário vem dos catálogos do **next-intl** em `messages/`: `en.json` é a fonte e `pt-BR` é o idioma padrão.

As páginas ficam sob um prefixo de idioma (`/pt-BR/patients`, `/en/patients`); `/` redireciona conforme o idioma do navegador. As rotas de API não têm prefixo (`/api/users`). Erros de domínio carregam um código estável (`INVALID_LOGIN`), traduzido pela interface a partir de `<capacidade>.errors.<código>`.

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
| Idioma escolhido por cookie, sem prefixo na URL | Ler o cookie no layout raiz impede a pré-renderização com `cacheComponents`: toda página passaria a ser gerada a cada requisição |
| Textos fixos em português | Impede um segundo idioma e acopla as mensagens de erro ao domínio |

## Consequências

- Positivas: um único idioma no código; páginas pré-renderizadas por idioma; um teste garante que todos os catálogos têm as mesmas chaves e que todo código de erro e papel tem tradução.
- Negativas / riscos: diagramas e casos de uso precisam da tabela de correspondência acima; as URLs das páginas incluem o código do idioma; toda tela nova exige a chave em todos os catálogos.
