import { ArrowRight, Building2, User } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { Button } from '../../../../components/ui/Button/Button';
import { Checkbox } from '../../../../components/ui/Checkbox/Checkbox';
import { Divider } from '../../../../components/ui/Divider/Divider';
import { Input } from '../../../../components/ui/Input/Input';
import { useLogin } from '../../hooks/useLogin';
import type { AuthSession, LoginFormErrors } from '../../types/auth.types';
import styles from './LoginForm.module.css';
import { PasswordInput } from '../PasswordInput/PasswordInput';

interface LoginFormProps {
  onAuthenticated: (session: AuthSession) => void;
}

// O backend ainda não possui fluxo de recuperação de senha nem integração SSO.
const PENDING_FEATURE_NOTICES = {
  passwordRecovery: 'A recuperação de senha ainda não está disponível. Procure o administrador da clínica.',
  sso: 'O acesso por SSO ainda não está disponível neste ambiente.',
} as const;

export function LoginForm({ onAuthenticated }: LoginFormProps) {
  const identifierRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const focusFirstInvalidField = useCallback((errors: LoginFormErrors) => {
    (errors.identifier ? identifierRef : passwordRef).current?.focus();
  }, []);

  const { values, errors, submitError, isSubmitting, setValue, handleSubmit } = useLogin({
    onAuthenticated,
    onInvalid: focusFirstInvalidField,
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <header className={styles.header}>
        <h1 className={styles.title}>Bem-vindo ao CliniCore!</h1>
        <p className={styles.subtitle}>Faça login para acessar o sistema.</p>
      </header>

      {submitError && (
        <p className={styles.alert} role="alert">
          {submitError}
        </p>
      )}

      <div className={styles.fields}>
        <Input
          ref={identifierRef}
          label="E-mail ou usuário"
          name="identifier"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Digite seu e-mail ou usuário"
          startIcon={<User size={18} />}
          value={values.identifier}
          error={errors.identifier}
          onChange={(event) => setValue('identifier', event.target.value)}
        />
        <PasswordInput
          ref={passwordRef}
          label="Senha"
          name="password"
          autoComplete="current-password"
          placeholder="Digite sua senha"
          value={values.password}
          error={errors.password}
          onChange={(event) => setValue('password', event.target.value)}
        />
      </div>

      <div className={styles.options}>
        <Checkbox
          label="Lembrar de mim"
          name="rememberMe"
          checked={values.rememberMe}
          onChange={(event) => setValue('rememberMe', event.target.checked)}
        />
        <button type="button" className={styles.linkButton} onClick={() => setNotice(PENDING_FEATURE_NOTICES.passwordRecovery)}>
          Esqueceu sua senha?
        </button>
      </div>

      <Button type="submit" loading={isSubmitting} rightIcon={<ArrowRight size={18} aria-hidden="true" />}>
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </Button>

      <Divider label="ou" />

      <Button variant="secondary" leftIcon={<Building2 size={18} aria-hidden="true" />} onClick={() => setNotice(PENDING_FEATURE_NOTICES.sso)}>
        Acessar com SSO
      </Button>

      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}
    </form>
  );
}
