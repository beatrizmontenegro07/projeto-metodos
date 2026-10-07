# SPEC-001 — Gerenciamento de usuários (Sprint 1)

## Escopo
Adicionar usuários e listar todos os usuários, com persistência em coleção na memória RAM.

## Modelo: `Usuario`
| Campo         | Tipo       | Regra                                              |
|---------------|------------|----------------------------------------------------|
| `id`          | UUID       | gerado automaticamente                             |
| `telegram_id` | int > 0    | obrigatório, **único** no sistema                  |
| `nome`        | str        | obrigatório, não vazio após `strip()`              |
| `papel`       | `Papel`    | `ESTUDANTE` (padrão) ou `ADMINISTRADOR`            |
| `ativo`       | bool       | padrão `True`                                      |
| `criado_em`   | datetime   | UTC, gerado automaticamente                        |

> A senha/credencial do SIGAA **não** faz parte de `Usuario`. Será tratada em ADR próprio

## RF-01 — Adicionar usuário
- Entrada: `telegram_id`, `nome`, `papel` (opcional).
- Erro `DadosDeUsuarioInvalidos` se `telegram_id <= 0` ou `nome` vazio.
- Erro `UsuarioJaExiste` se já houver usuário com o mesmo `telegram_id`.
- Saída: `Usuario` persistido.

## RF-02 — Listar todos os usuários
- Retorna todos os usuários, em ordem de cadastro. Lista vazia se não houver nenhum.

## Fora de escopo (Sprints futuras)
Autorização por papel, remover/desativar, vínculo SIGAA, bot Telegram, monitoramento.
