# Projeto Métodos — contexto para agentes

## Especificações das atividades

Não mantenha instruções de sprints neste arquivo: elas mudam a cada atividade.
Para descobrir a especificação atual, consulte o SIGAA pelo MCP `sigaa` e leia
os corpos de tarefa e tópicos da disciplina antes de alterar o código. O
cliente e a documentação do MCP estão em
[`PucaVaz/sigaa-tools`](https://github.com/PucaVaz/sigaa-tools).

Fluxo mínimo:

1. execute `sigaa_sync`;
2. localize a tarefa em `sigaa_list_deadlines`;
3. leia `sigaa_get_tarefa_body` e os materiais/tópicos relacionados;
4. confirme o escopo no repositório antes de implementar.

## Estrutura e arquitetura

- `src/main/java/br/ufpb/mps/domain/`: entidades.
- `src/main/java/br/ufpb/mps/application/`: casos de uso, validações e portas.
- `src/main/java/br/ufpb/mps/infra/`: implementações de persistência.
- `src/main/java/br/ufpb/mps/interfaceadapters/`: entrada/saída da aplicação.
- `src/test/java/`: testes executáveis com `assert`.
- `docs/diagrams/`: fontes PlantUML e imagens renderizadas.

Mantenha as dependências apontando para dentro: adaptadores dependem da
aplicação; infraestrutura implementa as portas definidas pela aplicação.

## Regras de implementação

- Escreva o teste antes de alterar comportamento e execute-o em estado falho.
- Validações de domínio devem lançar exceções claras; não use valores mágicos ou
  `null` como sinal de erro.
- Não exponha ou persista senhas em texto puro. Para esta sprint, a senha serve
  somente para validação e não faz parte de `User` persistido.
- Mantenha os modos de persistência `memory` e `file`; a escolha ocorre no
  início da execução por `--storage=memory` ou `--storage=file`.
- Não versionar `users.bin`, `.class`, `out/`, `sources.txt`, credenciais ou
  artefatos de execução.
- Atualize o diagrama de classes de análise quando criar, remover ou alterar
  responsabilidades de classes relevantes.

## Verificação obrigatória

Use JDK 17 pelo contêiner, sem instalar dependências locais:

```bash
docker run --rm -v "$PWD":/app -w /app eclipse-temurin:17-jdk sh -c \
'find src/main/java src/test/java -name "*.java" > /tmp/sources.txt && \
javac -Xlint:all -d /tmp/mps-out @/tmp/sources.txt && \
java -ea -cp /tmp/mps-out br.ufpb.mps.Sprint02Tests'
```

Para diagramas, renderize antes de concluir:

```bash
docker run --rm --user 0 -v "$PWD/docs/diagrams":/data plantuml/plantuml:latest \
-tpng /data/classes-de-analise.puml
```

## Git

- Trabalhe em branch `feat/`, `fix/`, `docs/` ou `refactor/`.
- Faça commits pequenos, em português ou inglês claro, no formato Conventional
  Commits.
- Abra PR; não faça push direto para `main`.
- Antes de reportar entrega, verifique o diff, execute os testes e leia o estado
  remoto da PR.
