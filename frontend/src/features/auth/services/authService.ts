import { ApiNetworkError, ApiResponseError, postJson, setAccessToken } from '../../../services/api/apiClient';
import { AuthError, type AuthSession, type LoginCredentials, type UserRole } from '../types/auth.types';

/** Formato devolvido por `POST /api/auth/login` no backend. */
interface LoginResponseDto {
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    login: string;
    papel: UserRole;
  };
}

export async function login({ identifier, password }: LoginCredentials): Promise<AuthSession> {
  try {
    const { token, usuario } = await postJson<LoginResponseDto>('/api/auth/login', {
      login: identifier,
      senha: password,
    });

    setAccessToken(token);
    return {
      accessToken: token,
      user: { id: usuario.id, name: usuario.nome, email: usuario.email, login: usuario.login, role: usuario.papel },
    };
  } catch (error) {
    if (error instanceof ApiNetworkError) throw new AuthError('NETWORK');
    if (error instanceof ApiResponseError && (error.status === 400 || error.status === 401)) {
      throw new AuthError('INVALID_CREDENTIALS');
    }
    throw new AuthError('UNEXPECTED');
  }
}

export function logout(): void {
  setAccessToken(null);
}

