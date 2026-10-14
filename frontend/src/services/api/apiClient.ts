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

export function getAccessToken(): string | null {
  return accessToken;
}

export class ApiNetworkError extends Error {
  constructor() {
    super('NETWORK');
    this.name = 'ApiNetworkError';
  }
}

export class ApiResponseError extends Error {
  readonly status: number;
  readonly data?: unknown;

  constructor(status: number, message?: string, data?: unknown) {
    super(message ?? `HTTP_${status}`);
    this.name = 'ApiResponseError';
    this.status = status;
    this.data = data;
  }
}

async function requestJson<TResponse>(
  method: string,
  path: string,
  body?: unknown,
): Promise<TResponse> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
  } catch {
    throw new ApiNetworkError();
  }

  if (!response.ok) {
    let errorData: any;
    let errorMessage: string | undefined;
    try {
      errorData = await response.json();
      if (errorData && typeof errorData.erro === 'string') {
        errorMessage = errorData.erro;
      }
    } catch {
      // Ignora erro no parse do corpo de erro
    }
    throw new ApiResponseError(response.status, errorMessage, errorData);
  }

  if (response.status === 204) {
    return null as TResponse;
  }

  return (await response.json()) as TResponse;
}

export async function getJson<TResponse>(path: string): Promise<TResponse> {
  return requestJson<TResponse>('GET', path);
}

export async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  return requestJson<TResponse>('POST', path, body);
}

export async function putJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  return requestJson<TResponse>('PUT', path, body);
}

export async function deleteJson<TResponse>(path: string): Promise<TResponse> {
  return requestJson<TResponse>('DELETE', path);
}
