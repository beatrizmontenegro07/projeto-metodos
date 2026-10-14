import { useState, type ReactNode } from 'react';
import type { AuthenticatedUser } from '../../../features/auth/types/auth.types';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  user?: AuthenticatedUser;
  onLogout?: () => void;
  children: ReactNode;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
}

export function AppLayout({
  user,
  onLogout,
  children,
  searchValue,
  onSearchChange,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar
        userRole={user?.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {sidebarOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className={styles.mainWrapper}>
        <Header
          user={user}
          onLogout={onLogout}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
        />
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}

