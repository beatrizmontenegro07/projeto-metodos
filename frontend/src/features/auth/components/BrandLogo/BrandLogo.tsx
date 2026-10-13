import styles from './BrandLogo.module.css';

export function BrandLogo() {
  return (
    <div className={styles.logo} role="img" aria-label="CliniCore">
      <svg className={styles.mark} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <rect x="16" y="2" width="16" height="44" rx="6" fill="#2b7be4" />
        <rect x="2" y="16" width="44" height="16" rx="6" fill="#4b93ee" />
        <circle cx="24" cy="24" r="7.5" fill="#ffffff" />
        <circle cx="24" cy="24" r="3.5" fill="#2b7be4" />
      </svg>
      <span className={styles.wordmark} aria-hidden="true">
        <span className={styles.clini}>Clini</span>
        <span className={styles.core}>Core</span>
      </span>
    </div>
  );
}
