package br.ufpb.mps.application;
import br.ufpb.mps.infra.*;
import java.nio.file.Path;
public final class UserRepositoryFactory {
    private UserRepositoryFactory() { }
    public static UserRepository create(String storage, Path file) {
        return switch (storage) { case "memory" -> new MemoryUserRepository(); case "file" -> new BinaryFileUserRepository(file); default -> throw new ValidationException("Persistência deve ser memory ou file."); };
    }
}
