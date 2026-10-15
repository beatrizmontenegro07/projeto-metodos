# rnf/seguranca Specification

## Purpose
Requisitos não funcionais de proteção das credenciais dos usuários do CliniCore.

## Requirements

### Requirement: NF-SEG-01 — Senha nunca exibida nem armazenada em texto puro
O sistema NÃO DEVE exibir a senha em listagens, respostas ou mensagens de erro, e NÃO DEVE armazená-la em texto puro: apenas o hash derivado com scrypt e salt aleatório de 16 bytes é gravado.

**Prioridade:** Essencial
**Casos de uso:** UC05, UC06

#### Scenario: Usuário cadastrado
- **GIVEN** o Administrador cadastra um usuário com a senha "Secret@123"
- **WHEN** o registro gravado e a listagem de usuários são inspecionados
- **THEN** nenhum dos dois contém a senha; o registro gravado contém apenas o hash

#### Scenario: Erro de validação
- **WHEN** um cadastro é recusado por senha inválida
- **THEN** a mensagem de erro descreve a regra violada sem repetir a senha digitada
