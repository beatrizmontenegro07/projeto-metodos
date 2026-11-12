# ADR-0011: Template Method para relatórios de acesso

- **Status:** aceito
- **Data:** 2026-11-11
- **Requisitos relacionados:** RF18, UC15, S4.4

## Decisão

`AccessReportTemplate.generate` é o Template Method: valida o período UTC, consulta `AccessRecordRepository`, filtra `[início, fim)`, agrega por usuário e chama o método abstrato `render`. `HtmlAccessReport` e `CsvAccessReport` especializam somente a renderização. A contagem inclui registros repetidos; a última data é o máximo cronológico, sem depender da ordem de inserção. As linhas são ordenadas por ID e o total geral conta todos os registros do período.

`FacadeSingletonController.generateAccessReport` verifica `GENERATE_ACCESS_REPORTS` (somente ADMIN) antes de validar entrada ou consultar os dados. Os textos são recebidos por `ReportLabels`, permitindo tradução na fronteira sem dependência de next-intl em business. HTML escapa texto; CSV usa campos entre aspas, escape de aspas e CRLF.

## Consequências

Um novo formato implementa `render` e reutiliza o mesmo algoritmo, evitando divergências estatísticas entre formatos. O resultado contém conteúdo, tipo de mídia e extensão. Períodos vazios geram total zero; períodos inválidos geram erros específicos por campo; falhas de armazenamento são propagadas, sem emitir relatório vazio como se fosse válido.

A geração é acessível pela fachada; `/access-reports` permite baixar o arquivo via `GET /api/access-reports`, com textos traduzidos, validação e proteção por papel. A API fornece `Content-Disposition: attachment` e desabilita cache. A coleta filtra os registros em memória após `list`; consultas por período no banco poderão ser introduzidas caso o volume exija.
