package br.ufpb.mps.interfaceadapters;
import br.ufpb.mps.application.*;
import java.nio.file.Path;
public final class Main {
    public static void main(String[] args) {
        String storage = args.length == 0 ? "memory" : args[0].replace("--storage=", "");
        try { UserService service = new UserService(UserRepositoryFactory.create(storage, Path.of("users.bin"))); System.out.println("Persistência ativa: " + storage + "; usuários: " + service.list().size()); }
        catch (ValidationException error) { System.err.println(error.getMessage()); System.exit(2); }
    }
}
