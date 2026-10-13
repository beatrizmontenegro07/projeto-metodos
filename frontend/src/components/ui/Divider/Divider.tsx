import styles from './Divider.module.css';

interface DividerProps {
  label?: string;
}

export function Divider({ label }: DividerProps) {
  return (
    <div className={styles.divider} role="separator">
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
