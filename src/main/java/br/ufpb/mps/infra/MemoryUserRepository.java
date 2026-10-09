package br.ufpb.mps.infra;
import br.ufpb.mps.application.UserRepository;
import br.ufpb.mps.domain.User;
import java.util.*;
public final class MemoryUserRepository implements UserRepository {
    private final List<User> users = new ArrayList<>();
    public void save(User user) { users.add(user); }
    public List<User> findAll() { return List.copyOf(users); }
}
