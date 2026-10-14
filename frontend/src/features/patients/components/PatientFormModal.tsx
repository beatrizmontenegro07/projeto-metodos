import { Modal } from '../../../components/ui/Modal/Modal';
import type { Patient, PatientFormData } from '../types/patient.types';
import { PatientForm } from './PatientForm';

interface PatientFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  patient?: Patient | null;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => Promise<void>;
  loading?: boolean;
  apiError?: string | null;
}

export function PatientFormModal({
  isOpen,
  mode,
  patient,
  onClose,
  onSubmit,
  loading = false,
  apiError,
}: PatientFormModalProps) {
  const title = mode === 'create' ? 'Novo paciente' : 'Editar paciente';
  const description =
    mode === 'create'
      ? 'Preencha as informações cadastrais do paciente.'
      : `Editando informações de ${patient?.nomeCompleto || 'paciente'}.`;

  return (
    <Modal isOpen={isOpen} onClose={loading ? () => {} : onClose} title={title} description={description} maxWidth="lg">
      <PatientForm
        key={patient ? `edit-${patient.id}` : 'create'}
        initialPatient={patient}
        mode={mode}
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
        apiError={apiError}
      />
    </Modal>
  );
}
