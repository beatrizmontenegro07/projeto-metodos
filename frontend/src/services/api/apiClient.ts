/**
 * Cliente HTTP mínimo e compartilhado. Usa `fetch` nativo para evitar dependências extras.
 * O token de acesso fica apenas em memória (variável de módulo): não é gravado em
 * localStorage/sessionStorage e é perdido ao recarregar a página.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export class ApiNetworkError extends Error {
  constructor() {
    super('NETWORK');
    this.name = 'ApiNetworkError';
  }
}

export class ApiResponseError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`HTTP_${status}`);
    this.name = 'ApiResponseError';
    this.status = status;
  }
}

export async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiNetworkError();
  }

  if (!response.ok) throw new ApiResponseError(response.status);
  return (await response.json()) as TResponse;
}

