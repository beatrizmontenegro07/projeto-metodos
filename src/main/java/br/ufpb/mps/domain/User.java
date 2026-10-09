package br.ufpb.mps.domain;
import java.io.Serializable;
public record User(String login, String name, String role) implements Serializable { }
