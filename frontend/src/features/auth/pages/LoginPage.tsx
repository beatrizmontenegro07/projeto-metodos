import { AuthLayout } from '../../../components/layout/AuthLayout/AuthLayout';
import { LoginBranding } from '../components/LoginBranding/LoginBranding';
import { LoginForm } from '../components/LoginForm/LoginForm';
import type { AuthSession } from '../types/auth.types';

interface LoginPageProps {
  onAuthenticated: (session: AuthSession) => void;
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  return (
    <AuthLayout branding={<LoginBranding />}>
      <LoginForm onAuthenticated={onAuthenticated} />
    </AuthLayout>
  );
}

