import {
  Bell,
  Calendar,
  ClipboardList,
  Home,
  MessageSquare,
  Settings,
  Stethoscope,
  UserCog,
  Users,
} from 'lucide-react';
import type { UserRole } from '../../../features/auth/types/auth.types';
import styles from './AppLayout.module.css';

interface SidebarProps {
  userRole?: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ userRole, isOpen = true }: SidebarProps) {
  // Pacientes é visível e acessível prioritariamente para ADMIN e RECEPCIONISTA
  const podeGerenciarPacientes = userRole === 'ADMINISTRADOR' || userRole === 'RECEPCIONISTA';

  const menuItems = [
    { id: 'inicio', label: 'Início', icon: Home, active: false, enabled: true },
    {
      id: 'pacientes',
      label: 'Pacientes',
      icon: Users,
      active: true,
      enabled: podeGerenciarPacientes,
    },
    { id: 'profissionais', label: 'Profissionais', icon: Stethoscope, active: false, enabled: true },
    { id: 'agenda', label: 'Agenda', icon: Calendar, active: false, enabled: true },
    { id: 'atendimentos', label: 'Atendimentos', icon: ClipboardList, active: false, enabled: true },
    { id: 'comunicacoes', label: 'Comunicações', icon: MessageSquare, active: false, enabled: true },
    { id: 'notificacoes', label: 'Notificações', icon: Bell, active: false, enabled: true },
    { id: 'usuarios', label: 'Usuários', icon: UserCog, active: false, enabled: userRole === 'ADMINISTRADOR' },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, active: false, enabled: true },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`} aria-label="Navegação principal">
      <div className={styles.sidebarHeader}>
        <div className={styles.logo} role="img" aria-label="CliniCore">
          <svg className={styles.logoMark} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <rect x="16" y="2" width="16" height="44" rx="6" fill="#38bdf8" />
            <rect x="2" y="16" width="44" height="16" rx="6" fill="#60a5fa" />
            <circle cx="24" cy="24" r="7.5" fill="#ffffff" />
            <circle cx="24" cy="24" r="3.5" fill="#0284c7" />
          </svg>
          <span className={styles.wordmark} aria-hidden="true">
            <span className={styles.clini}>Clini</span>
            <span className={styles.core}>Core</span>
          </span>
        </div>
      </div>

      <nav className={styles.menu} aria-label="Menu do sistema">
        <ul className={styles.menuList}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            if (!item.enabled) return null;

            return (
              <li key={item.id} className={styles.menuListItem}>
                <button
                  type="button"
                  className={`${styles.navItem} ${item.active ? styles.navItemActive : ''} `}
                  aria-current={item.active ? 'page' : undefined}
                >
                  <Icon size={18} className={styles.navIcon} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

