import { Badge } from '../../../components/ui/Badge/Badge';
import type { Patient } from '../types/patient.types';
import { formatCpf, formatDate, formatPatientId, formatPhone } from '../utils/patientFormatters';
import { PatientActions } from './PatientActions';
import styles from './PatientsTable.module.css';

interface PatientsTableProps {
  patients: Patient[];
  loading?: boolean;
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  canManage?: boolean;
  emptyMessage?: string;
}

export function PatientsTable({
  patients,
  loading = false,
  onView,
  onEdit,
  onDelete,
  canManage = true,
  emptyMessage = 'Nenhum paciente cadastrado.',
}: PatientsTableProps) {
  if (loading) {
    return (
      <div className={styles.loadingContainer} aria-busy="true">
        <div className={styles.spinner} aria-hidden="true" />
        <p className={styles.loadingText}>Carregando pacientes...</p>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyText}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table} aria-label="Tabela de pacientes">
        <thead>
          <tr>
            <th scope="col" className={styles.colId}>
              ID
            </th>
            <th scope="col" className={styles.colCpf}>
              CPF
            </th>
            <th scope="col" className={styles.colName}>
              Nome Completo
            </th>
            <th scope="col" className={styles.colBirth}>
              Data de Nascimento
            </th>
            <th scope="col" className={styles.colPhone}>
              Telefone
            </th>
            <th scope="col" className={styles.colEmail}>
              Email
            </th>
            <th scope="col" className={styles.colStatus}>
              Status
            </th>
            <th scope="col" className={styles.colActions}>
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => {
            const primaryPhone = patient.telefones?.[0];

            return (
              <tr key={patient.id} className={styles.row}>
                <td className={styles.cellId}>{formatPatientId(patient.id)}</td>
                <td className={styles.cellCpf}>{formatCpf(patient.cpf)}</td>
                <td className={styles.cellName}>
                  <span className={styles.nameText}>{patient.nomeCompleto}</span>
                </td>
                <td className={styles.cellBirth}>{formatDate(patient.dataNascimento)}</td>
                <td className={styles.cellPhone}>{formatPhone(primaryPhone)}</td>
                <td className={styles.cellEmail}>{patient.email || '—'}</td>
                <td className={styles.cellStatus}>
                  <Badge variant={patient.ativo ? 'active' : 'inactive'}>
                    {patient.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </td>
                <td className={styles.cellActions}>
                  <PatientActions
                    patient={patient}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    canManage={canManage}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

