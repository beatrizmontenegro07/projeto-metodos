import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, LogOut, Menu, Search } from 'lucide-react';
import type { AuthenticatedUser } from '../../../features/auth/types/auth.types';
import styles from './AppLayout.module.css';

interface HeaderProps {
  user?: AuthenticatedUser;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
}

export function Header({
  user,
  onLogout,
  onToggleSidebar,
  searchValue,
  onSearchChange,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Obtém as iniciais do nome do usuário (ex.: "Carlos Almeida" -> "CA")
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatRole = (role?: string) => {
    switch (role) {
      case 'ADMINISTRADOR':
        return 'Administrador';
      case 'RECEPCIONISTA':
        return 'Recepcionista';
      case 'MEDICO':
        return 'Médico';
      case 'PACIENTE':
        return 'Paciente';
      default:
        return role || 'Usuário';
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          type="button"
          className={styles.menuToggle}
          onClick={onToggleSidebar}
          aria-label="Alternar menu lateral"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

      </div>

      <div className={styles.headerRight}>
        <button type="button" className={styles.notificationBtn} aria-label="Notificações">
          <Bell size={20} aria-hidden="true" />
          <span className={styles.notificationBadge} aria-label="Notificações não lidas" />
        </button>

        <div ref={menuRef} className={styles.userProfileWrapper}>
          <button
            type="button"
            className={styles.userProfileBtn}
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className={styles.avatar}>{getInitials(user?.name)}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name || 'Carlos Almeida'}</span>
              <span className={styles.userRole}>{formatRole(user?.role)}</span>
            </div>
            <ChevronDown size={16} className={styles.chevron} aria-hidden="true" />
          </button>

          {dropdownOpen && (
            <div className={styles.dropdownMenu} role="menu">
              <div className={styles.dropdownHeader}>
                <p className={styles.dropdownEmail}>{user?.email}</p>
              </div>
              <button
                type="button"
                className={styles.dropdownItem}
                role="menuitem"
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout?.();
                }}
              >
                <LogOut size={16} aria-hidden="true" />
                <span>Sair da conta</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
