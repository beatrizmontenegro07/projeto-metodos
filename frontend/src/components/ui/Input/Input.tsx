import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';

import styles from './Input.module.css';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
  startIcon?: ReactNode;
  endAdornment?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ label, error, startIcon, endAdornment, className, ref, ...rest }: InputProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={`${styles.control} ${error ? styles.invalid : ''}`}>
        {startIcon && <span className={styles.startIcon} aria-hidden="true">{startIcon}</span>}
        <input
          {...rest}
          ref={ref}
          id={id}
          className={`${styles.input} ${endAdornment ? styles.hasEnd : ''}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        {endAdornment && <span className={styles.endAdornment}>{endAdornment}</span>}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
