import { useCallback, useRef, useState, type FormEvent } from 'react';

import { login } from '../services/authService';
import {
  AuthError,
  type AuthSession,
  type LoginFormErrors,
  type LoginFormValues,
} from '../types/auth.types';
import { validateLoginForm } from '../utils/authValidation';
import {
  clearRememberedIdentifier,
  readRememberedIdentifier,
  saveRememberedIdentifier,
} from '../utils/rememberedIdentifier';

const SUBMIT_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'E-mail, usuário ou senha incorretos. Verifique os dados e tente novamente.',
  NETWORK: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
  UNEXPECTED: 'Ocorreu um erro inesperado ao entrar. Tente novamente em instantes.',
} as const;

interface UseLoginOptions {
  onAuthenticated: (session: AuthSession) => void;
  /** Chamado com os erros de validação para que a interface mova o foco ao primeiro campo inválido. */
  onInvalid?: (errors: LoginFormErrors) => void;
}

export function useLogin({ onAuthenticated, onInvalid }: UseLoginOptions) {
  const [values, setValues] = useState<LoginFormValues>(() => {
    const rememberedIdentifier = readRememberedIdentifier();
    return { identifier: rememberedIdentifier ?? '', password: '', rememberMe: rememberedIdentifier !== null };
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // O ref bloqueia envios duplicados mesmo antes de o React re-renderizar com isSubmitting = true.
  const isSubmittingRef = useRef(false);

  const setValue = useCallback(<K extends keyof LoginFormValues>(field: K, value: LoginFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (field === 'identifier' || field === 'password') {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmittingRef.current) return;

      const validationErrors = validateLoginForm(values);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) {
        onInvalid?.(validationErrors);
        return;
      }

      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const identifier = values.identifier.trim();
        const session = await login({ identifier, password: values.password });

        if (values.rememberMe) saveRememberedIdentifier(identifier);
        else clearRememberedIdentifier();

        onAuthenticated(session);
      } catch (error) {
        const code = error instanceof AuthError ? error.code : 'UNEXPECTED';
        setSubmitError(SUBMIT_ERROR_MESSAGES[code]);
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [values, onAuthenticated, onInvalid],
  );

  return { values, errors, submitError, isSubmitting, setValue, handleSubmit };
}

