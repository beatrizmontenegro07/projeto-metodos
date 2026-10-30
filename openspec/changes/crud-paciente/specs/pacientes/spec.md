# Spec Delta

## Purpose

Cadastro dos pacientes da clínica (entidade central do CRM): cadastro, regras dos dados, edição, inativação, reativação e busca, cada paciente vinculado ao usuário que o cadastrou.

## ADDED Requirements

### Requirement: RF01 — Cadastrar paciente
O sistema DEVE permitir que o Recepcionista ou o Administrador cadastre um paciente informando nome completo, CPF, data de nascimento, sexo, telefone e base legal do tratamento dos dados e, opcionalmente, e-mail e endereço. O paciente é criado ativo e vinculado ao usuário que o cadastrou. O sistema DEVE recusar um CPF já cadastrado, mesmo em cadastros simultâneos, e informar o motivo de qualquer recusa.

**Prioridade:** Essencial
**Casos de uso:** UC01

#### Scenario: Cadastro válido
- **GIVEN** a Recepcionista "Ana Silva" está autenticada e não existe paciente com o CPF "123.456.789-09"
- **WHEN** ela cadastra "Joana Souza Lima", CPF "123.456.789-09", nascimento 12/03/1985, sexo Feminino, telefone "(83) 98765-4321" e base legal Tutela da saúde
- **THEN** o paciente é armazenado ativo, com um identificador único, vinculado a "Ana Silva", e passa a aparecer na busca

#### Scenario: CPF já cadastrado
- **GIVEN** já existe um paciente com o CPF "123.456.789-09"
- **WHEN** a Recepcionista tenta cadastrar outro paciente com o CPF "12345678909"
- **THEN** o sistema recusa o cadastro informando "Já existe um paciente cadastrado com este CPF."

#### Scenario: Cadastros simultâneos com o mesmo CPF
- **GIVEN** não existe paciente com o CPF "529.982.247-25"
- **WHEN** dois cadastros com esse CPF chegam ao mesmo tempo
- **THEN** apenas um é armazenado, e o outro é recusado informando "Já existe um paciente cadastrado com este CPF."

#### Scenario: Sem base legal
- **WHEN** a Recepcionista tenta cadastrar um paciente sem informar a base legal do tratamento dos dados
- **THEN** o sistema recusa o cadastro informando "Informe a base legal do tratamento dos dados."

#### Scenario: Papel sem permissão
- **GIVEN** um Médico autenticado
- **WHEN** ele tenta cadastrar um paciente
- **THEN** o sistema nega o acesso e nenhum paciente é armazenado

### Requirement: RF11 — Regras dos dados do paciente
O sistema DEVE aceitar, no cadastro e na edição, apenas: nome com 1 a 120 caracteres; CPF com 11 dígitos (com ou sem pontuação) e dígitos verificadores válidos; data de nascimento válida e não futura; sexo Masculino, Feminino, Outro ou Desconhecido; telefone com DDD e 8 ou 9 dígitos; e-mail, se informado, em formato válido; endereço, se informado, com até 200 caracteres; base legal Consentimento do titular, Tutela da saúde, Cumprimento de obrigação legal ou Proteção da vida.

**Prioridade:** Essencial
**Casos de uso:** UC01, UC07

#### Scenario: Nome vazio
- **WHEN** a Recepcionista informa um nome vazio ou só com espaços
- **THEN** o sistema recusa informando "Informe o nome do paciente."

#### Scenario: Nome longo
- **WHEN** a Recepcionista informa um nome com 121 caracteres
- **THEN** o sistema recusa informando "O nome do paciente deve ter no máximo 120 caracteres."

#### Scenario: CPF com quantidade errada de dígitos
- **WHEN** a Recepcionista informa o CPF "123.456.789"
- **THEN** o sistema recusa informando "O CPF deve ter 11 dígitos."

#### Scenario: CPF com dígito verificador errado
- **WHEN** a Recepcionista informa o CPF "123.456.789-00"
- **THEN** o sistema recusa informando "O CPF informado é inválido."

#### Scenario: CPF com todos os dígitos iguais
- **WHEN** a Recepcionista informa o CPF "111.111.111-11"
- **THEN** o sistema recusa informando "O CPF informado é inválido."

#### Scenario: Nascimento no futuro
- **WHEN** a Recepcionista informa como data de nascimento o dia seguinte ao de hoje
- **THEN** o sistema recusa informando "A data de nascimento não pode estar no futuro."

#### Scenario: Data inexistente
- **WHEN** a Recepcionista informa a data de nascimento 31/02/1990
- **THEN** o sistema recusa informando "A data de nascimento é inválida."

#### Scenario: Telefone sem DDD
- **WHEN** a Recepcionista informa o telefone "98765-4321"
- **THEN** o sistema recusa informando "O telefone deve ter DDD e 8 ou 9 dígitos."

#### Scenario: E-mail inválido
- **WHEN** a Recepcionista informa o e-mail "joana@"
- **THEN** o sistema recusa informando "O e-mail do paciente é inválido."

#### Scenario: Campos opcionais em branco
- **WHEN** a Recepcionista deixa o e-mail e o endereço em branco e preenche os demais campos corretamente
- **THEN** o paciente é aceito sem e-mail e sem endereço

### Requirement: RF12 — Editar paciente
O sistema DEVE permitir que o Recepcionista ou o Administrador altere os dados de um paciente cadastrado, aplicando as mesmas regras de RF11 e recusando um CPF que pertença a outro paciente; a situação (ativo ou inativo) e o usuário que cadastrou não mudam na edição.

**Prioridade:** Essencial
**Casos de uso:** UC07

#### Scenario: Edição válida
- **GIVEN** a paciente "Joana Souza Lima" está cadastrada com o telefone "(83) 98765-4321"
- **WHEN** a Recepcionista altera o telefone para "(83) 3222-1100" e salva
- **THEN** a busca passa a exibir o novo telefone

#### Scenario: CPF de outro paciente
- **GIVEN** "Joana Souza Lima" tem o CPF "123.456.789-09" e "Bruno Lima" tem o CPF "529.982.247-25"
- **WHEN** a Recepcionista altera o CPF de "Bruno Lima" para "123.456.789-09"
- **THEN** o sistema recusa informando "Já existe um paciente cadastrado com este CPF."

#### Scenario: Paciente inexistente
- **WHEN** alguém tenta editar um paciente com um identificador que não existe
- **THEN** o sistema informa "Paciente não encontrado."

### Requirement: RF13 — Inativar e reativar paciente
O sistema DEVE permitir que o Recepcionista ou o Administrador inative um paciente ativo e reative um paciente inativo, mantendo todos os seus dados; o sistema NÃO DEVE oferecer a exclusão definitiva de pacientes.

**Prioridade:** Essencial
**Casos de uso:** UC08

#### Scenario: Inativar
- **GIVEN** a paciente "Joana Souza Lima" está ativa
- **WHEN** a Recepcionista confirma a inativação
- **THEN** a paciente aparece como Inativa na busca, com os mesmos dados

#### Scenario: Reativar
- **GIVEN** a paciente "Joana Souza Lima" está inativa
- **WHEN** a Recepcionista a reativa
- **THEN** a paciente volta a aparecer como Ativa

#### Scenario: CPF de paciente inativo
- **GIVEN** a paciente inativa "Joana Souza Lima" tem o CPF "123.456.789-09"
- **WHEN** a Recepcionista tenta cadastrar outro paciente com esse CPF
- **THEN** o sistema recusa informando "Já existe um paciente cadastrado com este CPF."

### Requirement: RF14 — Buscar pacientes
O sistema DEVE permitir que o Recepcionista ou o Administrador liste os pacientes em ordem alfabética do nome, filtrando por parte do nome (sem diferenciar maiúsculas, minúsculas e acentos) ou por parte do CPF e pela situação (ativos, inativos ou todos), exibindo nome, CPF, telefone, data de nascimento e situação.

**Prioridade:** Essencial
**Casos de uso:** UC09

#### Scenario: Busca por nome sem acento
- **GIVEN** "João Pereira" e "Maria Alves" estão cadastrados
- **WHEN** a Recepcionista busca "joao"
- **THEN** o sistema exibe apenas "João Pereira"

#### Scenario: Busca por parte do CPF
- **GIVEN** "Joana Souza Lima" tem o CPF "123.456.789-09"
- **WHEN** a Recepcionista busca "456.789"
- **THEN** o sistema exibe "Joana Souza Lima"

#### Scenario: Filtro de situação
- **GIVEN** "Joana Souza Lima" está ativa e "Bruno Lima" está inativo
- **WHEN** a Recepcionista filtra os inativos
- **THEN** o sistema exibe apenas "Bruno Lima"

#### Scenario: Ordem alfabética
- **GIVEN** "Bruno Lima", "Álvaro Dias" e "Carla Souza" foram cadastrados nessa ordem
- **WHEN** a Recepcionista lista todos os pacientes
- **THEN** o sistema exibe "Álvaro Dias", "Bruno Lima" e "Carla Souza", nessa ordem

#### Scenario: Nenhum paciente encontrado
- **WHEN** a busca não corresponde a nenhum paciente
- **THEN** o sistema exibe "Nenhum paciente encontrado."
