import { useState } from 'react';

import { LoginPage } from './features/auth/pages/LoginPage';
import { logout } from './features/auth/services/authService';
import type { AuthSession } from './features/auth/types/auth.types';
import styles from './App.module.css';

export function App() {
  // A sessão fica somente em memória: recarregar a página exige novo login.
  const [session, setSession] = useState<AuthSession | null>(null);

  if (!session) return <LoginPage onAuthenticated={setSession} />;

  const handleLogout = () => {
    logout();
    setSession(null);
  };

  // Marcador temporário: a área interna (pacientes, agenda etc.) ainda não foi implementada.
  return (
    <main className={styles.placeholder}>
      <h1>Login realizado com sucesso</h1>
      <p>
        Olá, {session.user.name}. A área interna do CliniCore ainda será implementada nas próximas entregas.
      </p>
      <button type="button" className={styles.logout} onClick={handleLogout}>
        Sair
      </button>
    </main>
  );
}
