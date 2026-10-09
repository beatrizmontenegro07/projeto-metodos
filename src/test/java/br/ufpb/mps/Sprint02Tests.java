package br.ufpb.mps;

import br.ufpb.mps.application.UserRepositoryFactory;
import br.ufpb.mps.application.UserService;
import br.ufpb.mps.application.ValidationException;
import br.ufpb.mps.domain.User;
import br.ufpb.mps.infra.BinaryFileUserRepository;
import br.ufpb.mps.infra.MemoryUserRepository;
import java.nio.file.Files;
import java.nio.file.Path;

public final class Sprint02Tests {
    public static void main(String[] args) throws Exception {
        rejectsInvalidLogin(); rejectsWeakPassword(); storesUsersInMemory();
        storesUsersInBinaryFile(); selectsPersistenceAtStartup();
        System.out.println("Sprint 02: 5 cenários verificados.");
    }
    static void rejectsInvalidLogin() {
        UserService service = new UserService(new MemoryUserRepository());
        expectValidation(() -> service.register("ana1", "Senha@123", "Ana", "student"));
        expectValidation(() -> service.register("", "Senha@123", "Ana", "student"));
        expectValidation(() -> service.register("abcdefghijklmn", "Senha@123", "Ana", "student"));
    }
    static void rejectsWeakPassword() {
        expectValidation(() -> new UserService(new MemoryUserRepository()).register("ana", "semmaiuscula1!", "Ana", "student"));
    }
    static void storesUsersInMemory() {
        UserService service = new UserService(new MemoryUserRepository()); service.register("ana", "Senha@123", "Ana", "student");
        assert service.list().size() == 1 && service.list().get(0).login().equals("ana");
    }
    static void storesUsersInBinaryFile() throws Exception {
        Path file = Files.createTempFile("mps-users", ".bin"); Files.delete(file);
        UserService service = new UserService(new BinaryFileUserRepository(file)); service.register("bia", "Senha@123", "Beatriz", "admin");
        assert service.list().equals(java.util.List.of(new User("bia", "Beatriz", "admin")));
    }
    static void selectsPersistenceAtStartup() {
        assert UserRepositoryFactory.create("memory", Path.of("ignored")) instanceof MemoryUserRepository;
        assert UserRepositoryFactory.create("file", Path.of("users.bin")) instanceof BinaryFileUserRepository;
        expectValidation(() -> UserRepositoryFactory.create("other", Path.of("users.bin")));
    }
    static void expectValidation(Runnable action) { try { action.run(); throw new AssertionError("expected validation error"); } catch (ValidationException expected) { } }
}
