import { Button } from '../../../components/ui/Button/Button';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Modal } from '../../../components/ui/Modal/Modal';
import type { Patient } from '../types/patient.types';
import {
  formatCep,
  formatCpf,
  formatDate,
  formatGender,
  formatPatientId,
  formatPhone,
} from '../utils/patientFormatters';
import styles from './PatientDetailsModal.module.css';

interface PatientDetailsModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientDetailsModal({ patient, isOpen, onClose }: PatientDetailsModalProps) {
  if (!patient) return null;

  const endereco = patient.endereco;
  const temEndereco =
    endereco &&
    (endereco.logradouro ||
      endereco.numero ||
      endereco.bairro ||
      endereco.cidade ||
      endereco.uf ||
      endereco.cep);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes do Paciente"
      maxWidth="md"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      <div className={styles.container}>
        {/* Cabeçalho resumido com avatar e status */}
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {patient.nomeCompleto.slice(0, 2).toUpperCase()}
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.titleRow}>
              <h3 className={styles.patientName}>{patient.nomeCompleto}</h3>
              <Badge variant={patient.ativo ? 'active' : 'inactive'}>
                {patient.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <span className={styles.patientId}>
              Identificador: {formatPatientId(patient.id)}
            </span>
          </div>
        </div>

        {/* Seção 1: Dados Pessoais */}
        <section className={styles.section} aria-labelledby="section-pessoal">
          <h4 id="section-pessoal" className={styles.sectionTitle}>
            Dados Pessoais
          </h4>
          <div className={styles.grid}>
            <div className={styles.field}>
              <span className={styles.label}>CPF</span>
              <span className={styles.value}>{formatCpf(patient.cpf)}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Data de Nascimento</span>
              <span className={styles.value}>{formatDate(patient.dataNascimento)}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Gênero</span>
              <span className={styles.value}>{formatGender(patient.genero)}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>CNS (Cartão Nacional de Saúde)</span>
              <span className={styles.value}>{patient.cns || '—'}</span>
            </div>
          </div>
        </section>

        {/* Seção 2: Contato */}
        <section className={styles.section} aria-labelledby="section-contato">
          <h4 id="section-contato" className={styles.sectionTitle}>
            Informações de Contato
          </h4>
          <div className={styles.grid}>
            <div className={styles.field}>
              <span className={styles.label}>E-mail</span>
              <span className={styles.value}>{patient.email || '—'}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Telefone Principal</span>
              <span className={styles.value}>
                {patient.telefones && patient.telefones.length > 0
                  ? formatPhone(patient.telefones[0])
                  : '—'}
              </span>
            </div>
          </div>
        </section>

        {/* Seção 3: Endereço */}
        <section className={styles.section} aria-labelledby="section-endereco">
          <h4 id="section-endereco" className={styles.sectionTitle}>
            Endereço
          </h4>
          {temEndereco ? (
            <div className={styles.grid}>
              <div className={`${styles.field} ${styles.colSpan2}`}>
                <span className={styles.label}>Logradouro</span>
                <span className={styles.value}>
                  {[endereco?.logradouro, endereco?.numero].filter(Boolean).join(', ') || '—'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Complemento</span>
                <span className={styles.value}>{endereco?.complemento || '—'}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Bairro</span>
                <span className={styles.value}>{endereco?.bairro || '—'}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Cidade / UF</span>
                <span className={styles.value}>
                  {[endereco?.cidade, endereco?.uf].filter(Boolean).join(' - ') || '—'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>CEP</span>
                <span className={styles.value}>{formatCep(endereco?.cep) || '—'}</span>
              </div>
            </div>
          ) : (
            <p className={styles.emptyNote}>Nenhum endereço cadastrado.</p>
          )}
        </section>
      </div>
    </Modal>
  );
}

