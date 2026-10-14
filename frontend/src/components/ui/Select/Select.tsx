import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Select.module.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  icon?: ReactNode;
}

export function Select({
  label,
  error,
  options,
  icon,
  className,
  value,
  onChange,
  disabled,
  ...rest
}: SelectProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <div className={`${styles.control} ${error ? styles.invalid : ''} ${disabled ? styles.disabled : ''}`}>
        {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
        <select
          {...rest}
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={styles.select}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className={styles.chevron} size={16} aria-hidden="true" />
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

