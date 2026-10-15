# ADR-0001: Usar monolito modular em camadas

- **Status:** aceito
- **Data:** 2026-10-14
- **Requisitos relacionados:** NF-MAN-01, NF-CON-01

## Contexto

O CliniCore é desenvolvido por uma equipe de 3 estudantes em sprints curtas, com entregas a cada 1 a 3 semanas, e cresce por capacidade: usuários, pacientes, agendamentos e atendimentos. As regras de negócio (validação de login e senha, CPF único, desfazer atualização) precisam ser testadas sem interface nem banco permanente, e a disciplina pede camadas **ui**, **business** e **infra** separadas.

## Decisão

Implementar o sistema como um único aplicativo, organizado em camadas e dividido em módulos por capacidade:

- **ui** (`src/app/`, `src/components/ui/`): páginas e rotas de API;
- **business** (`src/modules/<capacidade>/`): uma pasta por capacidade (`users`, depois `patients`), com entidades, regras, erros de domínio e controles;
- **infra** (`src/db/`): esquema, conexão e migrações do banco.

As dependências apontam sempre para dentro (ui → business → infra), e os controles recebem o `Database` pelo construtor. Os módulos seguem as pastas de `openspec/specs/`, e cada requisito tem um lugar óbvio no código. A tecnologia usada para implementar esta estrutura está no [ADR-0004](0004-nextjs-typescript-sqlite.md).

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Microsserviços por capacidade | Custo de implantação e de comunicação entre serviços desproporcional para 3 pessoas e um semestre |
| Aplicativo sem camadas (regras dentro das páginas e rotas) | As regras ficariam acopladas ao framework e ao banco, difíceis de testar e de rastrear até as specs |
| Camadas globais (`domain/`, `application/`, `infra/`) sem divisão por capacidade | Cada nova entidade espalha arquivos por todas as pastas; com módulos por capacidade, uma mudança fica numa só pasta |

## Consequências

- Positivas: um único deploy; as regras de negócio são testadas com um banco `:memory:`, sem interface; cada módulo pode ser rastreado até a sua spec.
- Negativas: escala apenas verticalmente, o que é aceitável para o volume de uma clínica. A regra de dependência entre camadas é mantida na revisão dos PRs, pois ainda não existe um teste automático que a verifique.
