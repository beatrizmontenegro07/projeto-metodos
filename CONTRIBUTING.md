# Guia de Contribuição

Este documento define as práticas e convenções adotadas no projeto. Todo membro da equipe — humano ou agente IA — deve segui-las.

---

## 1. Estratégia de branches

O repositório possui uma única branch de longa duração, `main`, que não recebe commits diretos.

```
main ──────●──────────●──────────●──────────────► entregas (tags vX.Y.Z)
           ▲          ▲          ▲
           │ PR       │ PR       │ PR
       feat/x      fix/y    refactor/z   ← branches de trabalho (curta duração)
```

### `main`

- Branch de integração e de entrega: deve estar sempre funcional (CI passando)
- Branches de feature, fix, docs e refactor partem dela e voltam a ela via PR
- Em cada data do [cronograma](docs/00-entregas.md), o commit de `main` que corresponde à entrega é **tagueado** com a versão: `v0.2.0`

### Fluxo resumido

```
1. Partir de main
   git checkout main && git pull
   git checkout -b feat/42-nome-da-feature

2. Desenvolver com commits atômicos

3. Abrir PR de feat/42-... → main
   (revisão, CI, aprovação)

4. Merge em main

5. Na data da entrega: tag da versão no commit de main
   git tag v0.2.0 && git push origin v0.2.0
```

Uma correção urgente segue o mesmo fluxo, com uma branch `fix/...` a partir de `main`.

---

## 2. Commits

### Formato (Conventional Commits)

```
<tipo>(<escopo>): <descrição curta no imperativo>

[corpo opcional — o quê e por quê, não como]

[rodapé opcional: refs, breaking changes]
```

**Tipos permitidos:**

| Tipo       | Quando usar                                               |
|------------|-----------------------------------------------------------|
| `feat`     | Nova funcionalidade visível ao usuário/sistema            |
| `fix`      | Correção de bug                                           |
| `refactor` | Mudança interna sem alterar comportamento externo         |
| `test`     | Adição ou correção de testes                              |
| `docs`     | Apenas documentação                                       |
| `chore`    | Build, CI, dependências, configs — sem código de produção |
| `style`    | Formatação, espaçamento — sem mudança de lógica           |
| `perf`     | Melhoria de performance                                   |
| `revert`   | Reverte um commit anterior                                |

**Escopo:** camada ou módulo afetado (`domain`, `auth`, `api`, `ui`, `ci`, etc.).

**Exemplos válidos:**

```
feat(auth): add JWT token authentication

fix(domain): fix discount calculation for split orders

refactor(user): extract e-mail validation into its own class

docs(adr): record the event sourcing decision (ADR-004)
```

**Regras:**
- Mensagem em **inglês**, como o código, no **imperativo** ("add", não "added" ou "adding"). O histórico faz parte do código, que é internacionalizado; a documentação pode continuar em português
- Máximo de **72 caracteres** na primeira linha
- Um commit = uma responsabilidade. Se precisar de "e" na descrição, considere dividir
- Commits de trabalho em progresso devem usar `wip:` e ser squashados antes do merge

---

## 3. Branches

```
<tipo>/<escopo-ou-issue>-<descricao-curta>
```

```
feat/42-autenticacao-jwt
fix/87-calculo-desconto-fracionado
refactor/user-validacao-email
docs/adr-event-sourcing
```

**Regras:**
- Nunca commitar diretamente em `main`
- Toda branch parte de `main` e volta a ela via PR (ver seção 1)
- Delete a branch após o merge

---

## 4. Práticas de Clean Code

> Independentes de linguagem. Válidas para qualquer camada.

### 3.1 Nomes revelam intenção

```
// ❌
int d;
bool flag;
void process(List x);

// ✅
int diasAteVencimento;
bool usuarioEstaAtivo;
void processarPedidosPendentes(List<Pedido> pedidos);
```

- Nomes de **variáveis e funções**: descrevem *o que são* ou *o que fazem*
- Nomes de **classes**: substantivos (`Pedido`, `AutenticadorDeUsuario`)
- Nomes de **funções/métodos**: verbos (`calcular`, `validar`, `buscar`)
- Evite abreviações que exijam contexto mental (`usrMgr` → `gerenciadorDeUsuario`)
- Evite prefixos redundantes (`pedido.pedidoId` → `pedido.id`)

### 3.2 Funções fazem uma coisa

- Uma função cabe em uma tela sem scroll → suspeite se precisar de mais
- Se você precisar usar "e" para descrever o que ela faz, extraia
- Parâmetros: idealmente 0–2; 3 é o limite; acima disso, agrupe em objeto

### 3.3 Não deixe comentários onde o código pode falar

```
// ❌ Comentário que repete o código
// Verifica se o usuário é maior de idade
if (usuario.idade >= 18) { ... }

// ✅ Nome que dispensa o comentário
if (usuario.eMaiorDeIdade()) { ... }
```

Comentários válidos: decisões de negócio não óbvias, workarounds com link para issue, advertências sobre efeitos colaterais.

### 3.4 Sem números mágicos ou strings soltas

```
// ❌
if (tentativas > 3) { ... }
status = "APROVADO";

// ✅
const val MAX_TENTATIVAS_LOGIN = 3;
if (tentativas > MAX_TENTATIVAS_LOGIN) { ... }
status = StatusPedido.APROVADO;
```

### 3.5 Regra do Escoteiro

> Deixe o código *ligeiramente* melhor do que você encontrou.

Não é refactoring massivo — é renomear uma variável confusa, extrair um bloco repetido, remover um TODO resolvido.

### 3.6 Testes são cidadãos de primeira classe

- Todo bug corrigido ganha um teste que o reproduz antes do fix
- Nomes de teste descrevem o cenário: `deve_retornar_erro_quando_email_invalido`
- Um teste = um comportamento verificado
- Testes não devem depender de ordem de execução

---

## 5. Pull Requests

**Título:** mesmo formato de commit, em inglês (`feat(auth): add Google sign-in`)

**Checklist antes de abrir o PR:**
- [ ] Testes passando localmente
- [ ] Cobertura não regrediu
- [ ] Nenhum `TODO` novo sem issue associada
- [ ] Documentação atualizada (se aplicável)
- [ ] ADR criado (se decisão arquitetural foi tomada)

**Tamanho:** PRs grandes são difíceis de revisar. Prefira PRs focados. Se ultrapassar ~400 linhas, justifique ou divida.

---

## 6. Para Agentes IA

Ao atuar neste repositório, siga adicionalmente:

1. **Leia `docs/specs/` antes de implementar** — ali está o contrato do que deve ser feito
2. **Leia o ADR relevante** antes de propor mudanças arquiteturais
3. **Nunca altere contratos públicos** (interfaces, APIs, eventos) sem registrar um novo ADR
4. **Prefira edições cirúrgicas** a reescritas completas de arquivos existentes
5. **Documente suposições** no corpo do commit quando o requisito for ambíguo
6. **Não invente dependências** externas sem registrar no PR por que são necessárias
