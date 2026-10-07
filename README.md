# SIGAA Bot

Bot de Telegram que se conecta ao SIGAA (via *sigaa-tools*) para responder perguntas
e enviar notificações acadêmicas. **Toda a documentação vive neste repositório (docs as code)**,
incluindo o relatório.

## Atores

| Ator              | Papel                                                              |
|-------------------|--------------------------------------------------------------------|
| **Estudante**     | Usa o bot no Telegram (perguntas + notificações)                   |
| **Administrador** | Gerencia usuários e monitora a atividade do bot                    |
| SIGAA / Telegram  | Sistemas externos (atores secundários)                             |

## Estrutura

```
docs/
  specs/       contratos do que deve ser implementado (lidos antes de codar)
  adr/         decisões arquiteturais
  uml/         casos de uso e classes de análise (Mermaid)
  relatorio/   relatório do projeto (Markdown)
src/sigaa_bot/
  dominio/     ENTIDADES: Usuario, Papel, exceções de domínio
  repositorio/ persistência (contrato + implementação em memória RAM)
  controle/    CONTROLES: regras de aplicação (ControladorDeUsuarios)
  fronteira/   FRONTEIRAS: interfaces com o mundo externo (console admin; Telegram depois)
tests/         testes automatizados (espelham src/)
```

Dependências apontam para dentro: `fronteira → controle → repositorio → dominio`.

## Como rodar

```bash
python -m venv .venv && source .venv/bin/activate
python -m venv .venv && source .venv/bin/activate
pytest                   # testes
python -m sigaa_bot      # console do administrador (dados em RAM)
```

## Status

- [x] Sprint 1: adicionar usuário e listar usuários (persistência em RAM)
- [ ] Sprint 2+: bot Telegram, vínculo com SIGAA, notificações, monitoramento

Contribuição: veja [CONTRIBUTING.md](CONTRIBUTING.md).
