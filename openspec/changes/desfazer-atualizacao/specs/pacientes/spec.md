## ADDED Requirements

### Requirement: RF19 - Desfazer a última alteração do paciente
O sistema DEVE permitir que o Recepcionista ou o Administrador desfaça a última alteração dos dados de um paciente, devolvendo os dados que ele tinha antes dessa edição. A situação (ativo ou inativo) e o usuário que cadastrou não mudam. Alterações sucessivas DEVEM ser desfeitas uma por vez, da mais recente para a mais antiga. O histórico de alterações PODE se perder quando o servidor reinicia.

**Prioridade:** Essencial
**Casos de uso:** UC07

#### Scenario: Desfazer uma edição
- **GIVEN** a paciente "Joana Souza Lima" teve o nome alterado para "Joana Lima"
- **WHEN** a Recepcionista escolhe "Desfazer última alteração"
- **THEN** o nome volta a ser "Joana Souza Lima" e o sistema informa "Última alteração desfeita."

#### Scenario: Edições sucessivas
- **GIVEN** o nome de "Joana Souza Lima" foi alterado para "Joana Lima" e depois para "Joana S. Lima"
- **WHEN** a Recepcionista desfaz duas vezes
- **THEN** o nome volta primeiro para "Joana Lima" e depois para "Joana Souza Lima"

#### Scenario: Nada para desfazer
- **GIVEN** um paciente que não foi alterado desde o início do servidor
- **WHEN** alguém tenta desfazer a última alteração
- **THEN** a tela não oferece "Desfazer última alteração" e a API responde 409 com "Não há alteração deste paciente para desfazer."

#### Scenario: Edição recusada
- **WHEN** uma edição é recusada por uma regra de RF11
- **THEN** ela não entra no histórico e não há o que desfazer

#### Scenario: CPF antigo em uso
- **GIVEN** o CPF de "Joana Souza Lima" foi alterado e o CPF antigo passou a ser de outro paciente
- **WHEN** a Recepcionista desfaz a alteração
- **THEN** o sistema informa "Já existe um paciente cadastrado com este CPF.", nada muda e a alteração continua podendo ser desfeita

#### Scenario: Papel sem permissão
- **GIVEN** um Médico autenticado
- **WHEN** ele tenta desfazer a alteração de um paciente pela API
- **THEN** a resposta é 403 e os dados não mudam
