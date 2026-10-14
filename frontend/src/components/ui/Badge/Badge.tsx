import type { ReactNode } from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  variant?: 'active' | 'inactive' | 'info';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'active', children, className }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[variant], className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}

