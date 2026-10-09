package br.ufpb.mps.application;
import br.ufpb.mps.domain.User;
import java.util.List;
public interface UserRepository { void save(User user); List<User> findAll(); }
