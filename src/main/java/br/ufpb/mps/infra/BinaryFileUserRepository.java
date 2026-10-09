package br.ufpb.mps.infra;
import br.ufpb.mps.application.UserRepository;
import br.ufpb.mps.domain.User;
import java.io.*;
import java.nio.file.*;
import java.util.*;
public final class BinaryFileUserRepository implements UserRepository {
    private final Path path;
    public BinaryFileUserRepository(Path path) { this.path = path; }
    public void save(User user) { List<User> users = new ArrayList<>(findAll()); users.add(user); write(users); }
    public List<User> findAll() {
        if (!Files.exists(path)) return List.of();
        try (var in = new ObjectInputStream(Files.newInputStream(path))) {
            Object stored = in.readObject();
            if (!(stored instanceof List<?> values) || !values.stream().allMatch(User.class::isInstance)) throw new IllegalStateException("Arquivo de usuários inválido.");
            return values.stream().map(User.class::cast).toList();
        } catch (IOException | ClassNotFoundException e) { throw new IllegalStateException("Falha ao ler usuários.", e); }
    }
    private void write(List<User> users) { try (var out = new ObjectOutputStream(Files.newOutputStream(path))) { out.writeObject(users); } catch (IOException e) { throw new IllegalStateException("Falha ao gravar usuários.", e); } }
}
