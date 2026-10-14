import { useState } from 'react';

import { AppLayout } from './components/layout/AppLayout/AppLayout';
import { LoginPage } from './features/auth/pages/LoginPage';
import { logout } from './features/auth/services/authService';
import type { AuthSession } from './features/auth/types/auth.types';
import { PatientsPage } from './features/patients/pages/PatientsPage';

export function App() {
  // A sessão fica somente em memória: recarregar a página exige novo login.
  const [session, setSession] = useState<AuthSession | null>(null);

  if (!session) return <LoginPage onAuthenticated={setSession} />;

  const handleLogout = () => {
    logout();
    setSession(null);
  };

  return (
    <AppLayout user={session.user} onLogout={handleLogout}>
      <PatientsPage currentUser={session.user} />
    </AppLayout>
  );
}
