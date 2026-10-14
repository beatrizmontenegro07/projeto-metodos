import { ConfirmDialog } from '../../../components/ui/ConfirmDialog/ConfirmDialog';
import type { Patient } from '../types/patient.types';
import { formatPatientId } from '../utils/patientFormatters';

interface DeletePatientDialogProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function DeletePatientDialog({
  isOpen,
  patient,
  onClose,
  onConfirm,
  loading = false,
}: DeletePatientDialogProps) {
  if (!patient) return null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Remover paciente?"
      message={`Tem certeza que deseja remover o paciente "${patient.nomeCompleto}" (${formatPatientId(patient.id)})? Esta ação não poderá ser desfeita.`}
      confirmLabel="Remover paciente"
      cancelLabel="Cancelar"
      loading={loading}
      variant="danger"
    />
  );
}

