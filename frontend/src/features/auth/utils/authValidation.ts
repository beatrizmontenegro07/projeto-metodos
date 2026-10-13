import type { LoginFormErrors, LoginFormValues } from '../types/auth.types';

export function validateLoginForm({ identifier, password }: Pick<LoginFormValues, 'identifier' | 'password'>): LoginFormErrors {
  const errors: LoginFormErrors = {};
  if (identifier.trim().length === 0) errors.identifier = 'Informe seu e-mail ou usuário.';
  if (password.length === 0) errors.password = 'Informe sua senha.';
  return errors;
}

