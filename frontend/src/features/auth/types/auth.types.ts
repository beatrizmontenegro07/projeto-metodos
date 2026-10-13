export type UserRole = 'ADMINISTRADOR' | 'RECEPCIONISTA' | 'MEDICO' | 'PACIENTE';

export interface LoginCredentials {
  /** E-mail ou nome de usuário (o backend aceita ambos no campo `login`). */
  identifier: string;
  password: string;
}

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  login: string;
  role: UserRole;
}

export interface AuthSession {
  user: AuthenticatedUser;
  /** Token JWT mantido apenas em memória; nunca persistido no navegador. */
  accessToken: string;
}

export type AuthErrorCode = 'INVALID_CREDENTIALS' | 'NETWORK' | 'UNEXPECTED';

/** Erro de autenticação sem detalhes internos do backend. */
export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode) {
    super(code);
    this.name = 'AuthError';
    this.code = code;
  }
}

export interface LoginFormValues {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export type LoginFormErrors = Partial<Record<'identifier' | 'password', string>>;

