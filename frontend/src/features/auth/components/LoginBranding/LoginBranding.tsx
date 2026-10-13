import { ShieldCheck } from 'lucide-react';

import illustration from '../../../../assets/images/login-illustration.jpg';
import { BrandLogo } from '../BrandLogo/BrandLogo';
import styles from './LoginBranding.module.css';

export function LoginBranding() {
  return (
    <div className={styles.branding}>
      <BrandLogo />

      <div className={styles.copy}>
        <p className={styles.headline}>Mais conexão para um cuidado de saúde completo.</p>
        <p className={styles.description}>
          Gerencie pacientes, agendamentos e comunicações com praticidade e segurança. Com interoperabilidade FHIR, o
          CliniCore conecta sua clínica a um ecossistema de saúde mais integrado.
        </p>
      </div>

      <img className={styles.illustration} src={illustration} alt="" width={1200} height={896} />

      <div className={styles.security}>
        <ShieldCheck className={styles.securityIcon} size={22} aria-hidden="true" />
        <div>
          <p className={styles.securityTitle}>Seus dados protegidos</p>
          <p className={styles.securityText}>Segurança, privacidade e conformidade com a LGPD.</p>
        </div>
      </div>
    </div>
  );
}
