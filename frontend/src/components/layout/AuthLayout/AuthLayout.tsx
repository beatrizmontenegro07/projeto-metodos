import type { ReactNode } from 'react';

import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  /** Painel de identidade visual (esquerda em telas grandes). */
  branding: ReactNode;
  /** Conteúdo principal, normalmente o formulário de autenticação. */
  children: ReactNode;
}

export function AuthLayout({ branding, children }: AuthLayoutProps) {
  return (
    <div className={styles.layout}>
      <aside className={styles.branding}>{branding}</aside>
      <main className={styles.content}>
        <div className={styles.contentInner}>{children}</div>
      </main>
    </div>
  );
}

