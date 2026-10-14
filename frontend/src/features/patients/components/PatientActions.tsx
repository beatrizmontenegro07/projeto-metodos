import { Pencil, Search, Trash2 } from 'lucide-react';
import type { Patient } from '../types/patient.types';
import styles from './PatientActions.module.css';

interface PatientActionsProps {
  patient: Patient;
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  canManage?: boolean;
}

export function PatientActions({
  patient,
  onView,
  onEdit,
  onDelete,
  canManage = true,
}: PatientActionsProps) {
  return (
    <div className={styles.actions} role="group" aria-label={`Ações para ${patient.nomeCompleto}`}>
      <button
        type="button"
        className={`${styles.actionBtn} ${styles.viewBtn}`}
        onClick={() => onView(patient)}
        title="Visualizar paciente"
        aria-label={`Visualizar dados de ${patient.nomeCompleto}`}
      >
        <Search size={15} aria-hidden="true" />
      </button>

      {canManage && (
        <>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.editBtn}`}
            onClick={() => onEdit(patient)}
            title="Editar paciente"
            aria-label={`Editar ${patient.nomeCompleto}`}
          >
            <Pencil size={15} aria-hidden="true" />
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => onDelete(patient)}
            title="Remover paciente"
            aria-label={`Remover ${patient.nomeCompleto}`}
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}
