import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState, type ComponentProps } from 'react';

import { Input } from '../../../../components/ui/Input/Input';
import styles from './PasswordInput.module.css';

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type' | 'startIcon' | 'endAdornment'>;

export function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const toggleLabel = isVisible ? 'Ocultar senha' : 'Mostrar senha';

  return (
    <Input
      {...props}
      type={isVisible ? 'text' : 'password'}
      startIcon={<Lock size={18} />}
      endAdornment={
        <button type="button" className={styles.toggle} onClick={() => setIsVisible((visible) => !visible)} aria-label={toggleLabel}>
          {isVisible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      }
    />
  );
}
