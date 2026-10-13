import type { InputHTMLAttributes } from 'react';

import styles from './Checkbox.module.css';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  return (
    <label className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      <input {...rest} type="checkbox" className={styles.input} />
      <span>{label}</span>
    </label>
  );
}
