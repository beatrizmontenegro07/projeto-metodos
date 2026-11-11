# Proposta: relatório de acessos

## Why
Os logs em stdout não garantem dados consultáveis para as estatísticas de acesso exigidas na Sprint 4.

## What Changes
- Persistir cada autenticação aceita em RAM ou SQLite via Repository e Abstract Factory (esta branch).
- Manter o Adapter Pino como log operacional independente.
- Gerar relatórios HTML e CSV de acessos por período usando Template Method na camada business (camadas de geração e download).

## Capabilities
### New Capabilities
- `acessos`: RF17 (registro de acesso) e RF18 (relatórios).
### Modified Capabilities
- Nenhuma.

## Impact
Tabela `access_records`, migração, família de repositórios, autenticação, tratamento de indisponibilidade e documentação. Sem mudança nos campos do login.

## Fora do escopo
Na mudança completa: navegação por páginas, IP, tentativas recusadas, logout e cadastro inicial do administrador como acesso.
