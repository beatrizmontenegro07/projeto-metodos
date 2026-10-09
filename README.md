# Projeto — Métodos de Projeto de Software

## Sprint 02

Cadastro de usuários com validação por exceções e persistência selecionável na inicialização:

- `memory`: coleção em RAM;
- `file`: arquivo binário `users.bin`.

O login deve ter apenas letras, não pode ser vazio e possui no máximo 12 caracteres. A senha exige no mínimo 8 caracteres, maiúscula, minúscula, número e símbolo.

### Verificação

```bash
docker run --rm -v "$PWD":/app -w /app eclipse-temurin:17-jdk sh -c \
'find src/main/java src/test/java -name "*.java" > sources.txt && javac -d out @sources.txt && java -ea -cp out br.ufpb.mps.Sprint02Tests'
```

O diagrama atualizado está em `docs/diagrams/classes-de-analise.puml`.
