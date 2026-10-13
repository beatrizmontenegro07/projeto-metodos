import type { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  variant = 'primary',
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classNames = [styles.button, styles[variant], className].filter(Boolean).join(' ');

  return (
    <button {...rest} type={type} className={classNames} disabled={disabled || loading} aria-busy={loading || undefined}>
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  );
}
