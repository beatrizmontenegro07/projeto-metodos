import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthError, type AuthSession } from '../types/auth.types';
import { login } from '../services/authService';
import { LoginPage } from './LoginPage';

vi.mock('../services/authService', () => ({ login: vi.fn() }));

const loginMock = vi.mocked(login);

const session: AuthSession = {
  accessToken: 'token-de-teste',
  user: { id: 1, name: 'Ana Silva', email: 'ana@clinicore.com', login: 'anasilva', role: 'RECEPCIONISTA' },
};

function renderPage(onAuthenticated = vi.fn()) {
  render(<LoginPage onAuthenticated={onAuthenticated} />);
  return {
    onAuthenticated,
    identifier: screen.getByLabelText(/e-mail ou usuário/i),
    password: screen.getByLabelText(/^senha$/i),
    submit: screen.getByRole('button', { name: /entrar/i }),
  };
}

describe('LoginPage', () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  it('renderiza o formulário e a identidade visual do CliniCore', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: /bem-vindo ao clinicore!/i })).toBeInTheDocument();
    expect(screen.getByText(/faça login para acessar o sistema\./i)).toBeInTheDocument();
    expect(screen.getByText(/mais conexão para um cuidado de saúde completo\./i)).toBeInTheDocument();
    expect(screen.getByText(/seus dados protegidos/i)).toBeInTheDocument();
    expect(screen.getByText(/conformidade com a lgpd/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail ou usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha$/i)).toHaveAttribute('type', 'password');
    expect(screen.getByRole('checkbox', { name: /lembrar de mim/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /esqueceu sua senha\?/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /acessar com sso/i })).toBeInTheDocument();
  });

  it('permite preencher os campos', async () => {
    const user = userEvent.setup();
    const { identifier, password } = renderPage();

    await user.type(identifier, 'anasilva');
    await user.type(password, 'Senha@123');

    expect(identifier).toHaveValue('anasilva');
    expect(password).toHaveValue('Senha@123');
  });

  it('alterna a visibilidade da senha', async () => {
    const user = userEvent.setup();
    const { password } = renderPage();

    await user.click(screen.getByRole('button', { name: /mostrar senha/i }));
    expect(password).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: /ocultar senha/i }));
    expect(password).toHaveAttribute('type', 'password');
  });

  it('valida os campos obrigatórios sem chamar o serviço', async () => {
    const user = userEvent.setup();
    const { identifier, submit } = renderPage();

    await user.click(submit);

    expect(await screen.findByText(/informe seu e-mail ou usuário\./i)).toBeInTheDocument();
    expect(screen.getByText(/informe sua senha\./i)).toBeInTheDocument();
    expect(identifier).toHaveAttribute('aria-invalid', 'true');
    expect(identifier).toHaveFocus();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('envia o formulário com Enter e repassa a sessão autenticada', async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue(session);
    const { onAuthenticated, identifier, password } = renderPage();

    await user.type(identifier, '  anasilva  ');
    await user.type(password, 'Senha@123{Enter}');

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith(session));
    expect(loginMock).toHaveBeenCalledWith({ identifier: 'anasilva', password: 'Senha@123' });
  });

  it('indica carregamento e impede envios duplicados', async () => {
    const user = userEvent.setup();
    let resolveLogin: (value: AuthSession) => void = () => undefined;
    loginMock.mockReturnValue(new Promise<AuthSession>((resolve) => { resolveLogin = resolve; }));
    const { identifier, password, submit } = renderPage();

    await user.type(identifier, 'anasilva');
    await user.type(password, 'Senha@123');
    await user.click(submit);
    await user.type(password, '{Enter}');
    await user.click(submit);

    const busyButton = screen.getByRole('button', { name: /entrando/i });
    expect(busyButton).toBeDisabled();
    expect(busyButton).toHaveAttribute('aria-busy', 'true');
    expect(loginMock).toHaveBeenCalledTimes(1);

    resolveLogin(session);
    await waitFor(() => expect(screen.getByRole('button', { name: /^entrar/i })).toBeEnabled());
  });

  it('mostra mensagem genérica quando as credenciais são recusadas', async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValue(new AuthError('INVALID_CREDENTIALS'));
    const { onAuthenticated, identifier, password, submit } = renderPage();

    await user.type(identifier, 'anasilva');
    await user.type(password, 'errada');
    await user.click(submit);

    expect(await screen.findByRole('alert')).toHaveTextContent(/e-mail, usuário ou senha incorretos/i);
    expect(onAuthenticated).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /^entrar/i })).toBeEnabled();
  });

  it('mostra mensagem apropriada quando a API está indisponível', async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValue(new AuthError('NETWORK'));
    const { identifier, password, submit } = renderPage();

    await user.type(identifier, 'anasilva');
    await user.type(password, 'Senha@123');
    await user.click(submit);

    expect(await screen.findByRole('alert')).toHaveTextContent(/não foi possível conectar ao servidor/i);
  });

  it('lembra apenas o identificador, nunca a senha ou o token', async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue(session);
    const { identifier, password, submit } = renderPage();

    await user.type(identifier, 'anasilva');
    await user.type(password, 'Senha@123');
    await user.click(screen.getByRole('checkbox', { name: /lembrar de mim/i }));
    await user.click(submit);
    await waitFor(() => expect(loginMock).toHaveBeenCalled());

    const stored = JSON.stringify({ ...window.localStorage });
    expect(stored).toContain('anasilva');
    expect(stored).not.toContain('Senha@123');
    expect(stored).not.toContain('token-de-teste');
    expect(JSON.stringify({ ...window.sessionStorage })).not.toContain('token-de-teste');
  });

  it('preenche o identificador lembrado e o remove quando a opção é desmarcada', async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue(session);
    window.localStorage.setItem('clinicore:remembered-identifier', 'anasilva');
    const { identifier, password, submit } = renderPage();

    expect(identifier).toHaveValue('anasilva');
    const checkbox = screen.getByRole('checkbox', { name: /lembrar de mim/i });
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    await user.type(password, 'Senha@123');
    await user.click(submit);
    await waitFor(() => expect(loginMock).toHaveBeenCalled());

    expect(window.localStorage.getItem('clinicore:remembered-identifier')).toBeNull();
  });

  it('informa que recuperação de senha e SSO ainda não estão disponíveis', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /esqueceu sua senha\?/i }));
    expect(await screen.findByRole('status')).toHaveTextContent(/recuperação de senha ainda não está disponível/i);

    await user.click(screen.getByRole('button', { name: /acessar com sso/i }));
    expect(await screen.findByRole('status')).toHaveTextContent(/acesso por sso ainda não está disponível/i);
    expect(loginMock).not.toHaveBeenCalled();
  });
});

