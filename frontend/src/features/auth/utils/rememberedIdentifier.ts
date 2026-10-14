const STORAGE_KEY = 'clinicore:remembered-identifier';

/**
 * "Lembrar de mim" guarda somente o e-mail/usuário digitado, para pré-preencher o campo.
 * Senhas, tokens e dados clínicos nunca são gravados no navegador.
 */
export function readRememberedIdentifier(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveRememberedIdentifier(identifier: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, identifier);
  } catch {
    // Armazenamento indisponível (modo privado, política do navegador): ignora sem quebrar o login.
  }
}

export function clearRememberedIdentifier(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ver comentário acima.
  }
}

