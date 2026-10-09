package br.ufpb.mps.application;
import br.ufpb.mps.domain.User;
import java.util.List;
public final class UserService {
    private final UserRepository repository;
    public UserService(UserRepository repository) { this.repository = repository; }
    public void register(String login, String password, String name, String role) {
        validateLogin(login); validatePassword(password); repository.save(new User(login, name, role));
    }
    public List<User> list() { return repository.findAll(); }
    private void validateLogin(String login) {
        if (login == null || login.isBlank() || login.length() > 12 || !login.matches("[A-Za-z]+"))
            throw new ValidationException("Login deve ter até 12 letras e não pode ser vazio.");
    }
    private void validatePassword(String password) {
        if (password == null || password.length() < 8 || !password.matches(".*[A-Z].*") || !password.matches(".*[a-z].*") || !password.matches(".*[0-9].*") || !password.matches(".*[^A-Za-z0-9].*"))
            throw new ValidationException("Senha deve ter 8+ caracteres, maiúscula, minúscula, número e símbolo.");
    }
}
