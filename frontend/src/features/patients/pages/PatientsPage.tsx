import { useState } from 'react';
import { Plus, Search, ShieldAlert } from 'lucide-react';
import { Button } from '../../../components/ui/Button/Button';
import { Pagination } from '../../../components/ui/Pagination/Pagination';
import { Select } from '../../../components/ui/Select/Select';
import type { AuthenticatedUser } from '../../auth/types/auth.types';
import { DeletePatientDialog } from '../components/DeletePatientDialog';
import { PatientDetailsModal } from '../components/PatientDetailsModal';
import { PatientFormModal } from '../components/PatientFormModal';
import { PatientsTable } from '../components/PatientsTable';
import { usePatientModal } from '../hooks/usePatientModal';
import { usePatients } from '../hooks/usePatients';
import { createPatient, deletePatient, updatePatient } from '../services/patientsService';
import type { PatientFormData } from '../types/patient.types';
import styles from './PatientsPage.module.css';

interface PatientsPageProps {
  currentUser?: AuthenticatedUser | null;
}

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos os status' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

const ORDER_OPTIONS = [
  { value: 'id', label: 'Ordenar por: ID' },
  { value: 'nome-asc', label: 'Ordenar por: Nome (A-Z)' },
  { value: 'nome-desc', label: 'Ordenar por: Nome (Z-A)' },
  { value: 'recentes', label: 'Ordenar por: Mais recentes' },
];

export function PatientsPage({ currentUser }: PatientsPageProps) {
  // Controle de autorização por perfil (RBAC)
  const isAuthorized =
    !currentUser ||
    currentUser.role === 'ADMINISTRADOR' ||
    currentUser.role === 'RECEPCIONISTA';

  const {
    patients,
    loading,
    error,
    filters,
    pagination,
    reload,
    setSearch,
    setStatus,
    setOrder,
    setPage,
  } = usePatients(10);

  const {
    modalType,
    selectedPatient,
    openView,
    openCreate,
    openEdit,
    openDelete,
    closeModal,
  } = usePatientModal();

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isAuthorized) {
    return (
      <div className={styles.restrictedCard} role="alert">
        <div className={styles.restrictedIcon} aria-hidden="true">
          <ShieldAlert size={28} />
        </div>
        <h2 className={styles.restrictedTitle}>Acesso restrito</h2>
        <p className={styles.restrictedDescription}>
          Você não possui permissão para gerenciar pacientes. O acesso a esta funcionalidade é
          restrito a Administradores e Recepcionistas.
        </p>
      </div>
    );
  }

  const handleCloseModal = () => {
    setFormError(null);
    closeModal();
  };

  const handleFormSubmit = async (data: PatientFormData) => {
    setSubmitting(true);
    setFormError(null);
    try {
      if (modalType === 'create') {
        await createPatient(data);
        setFeedbackMessage('Paciente cadastrado com sucesso!');
      } else if (modalType === 'edit' && selectedPatient) {
        await updatePatient(selectedPatient.id, data);
        setFeedbackMessage('Paciente atualizado com sucesso!');
      }
      handleCloseModal();
      await reload();
    } catch (err: any) {
      setFormError(err?.message || 'Ocorreu um erro ao processar a operação.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPatient) return;
    setSubmitting(true);
    try {
      await deletePatient(selectedPatient.id);
      setFeedbackMessage('Paciente removido com sucesso!');
      handleCloseModal();
      await reload();
    } catch (err: any) {
      setFeedbackMessage(`Erro ao remover paciente: ${err?.message || 'Falha inesperada.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Breadcrumb de navegação */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <span className={styles.breadcrumbLink}>Início</span>
        <span className={styles.breadcrumbSeparator} aria-hidden="true">
          ›
        </span>
        <span className={styles.breadcrumbCurrent}>Pacientes</span>
      </nav>

      {/* Cabeçalho da página */}
      <header className={styles.headerRow}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Pacientes</h1>
          <p className={styles.subtitle}>
            Gerencie os pacientes cadastrados no sistema, consulte históricos e atualize dados.
          </p>
        </div>
        <Button onClick={openCreate} className={styles.newButton}>
          <Plus size={18} aria-hidden="true" />
          Novo paciente
        </Button>
      </header>

      {/* Notificação de feedback / erro de carregamento */}
      {feedbackMessage && (
        <div className={`${styles.alertBanner} ${styles.alertSuccess}`} role="status">
          <span>{feedbackMessage}</span>
          <button
            type="button"
            className={styles.dismissBtn}
            onClick={() => setFeedbackMessage(null)}
            aria-label="Fechar mensagem de aviso"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className={`${styles.alertBanner} ${styles.alertError}`} role="alert">
          <span>{error}</span>
          <Button variant="secondary" onClick={reload}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Barra de busca e filtros */}
      <div className={styles.filtersCard} role="search">
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar paciente por nome, CPF ou e-mail..."
            aria-label="Buscar paciente"
            value={filters.busca}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filtersGroup}>
          <div className={styles.selectWrapper}>
            <Select
              aria-label="Filtrar por status"
              value={filters.status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={STATUS_OPTIONS}
            />
          </div>

          <div className={styles.selectWrapper}>
            <Select
              aria-label="Ordenar pacientes"
              value={filters.ordenacao}
              onChange={(e) => setOrder(e.target.value as any)}
              options={ORDER_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* Tabela de pacientes */}
      <section className={styles.tableCard} aria-label="Lista de pacientes">
        <PatientsTable
          patients={patients}
          loading={loading}
          onView={openView}
          onEdit={openEdit}
          onDelete={openDelete}
          canManage={true}
          emptyMessage={
            filters.busca || filters.status !== 'todos'
              ? 'Nenhum paciente encontrado para os filtros informados.'
              : 'Nenhum paciente cadastrado.'
          }
        />

        {/* Rodapé com paginação */}
        {!loading && pagination.totalItens > 0 && (
          <Pagination
            currentPage={pagination.pagina}
            totalPages={pagination.totalPaginas}
            totalItems={pagination.totalItens}
            pageSize={pagination.tamanhoPagina}
            onPageChange={setPage}
          />
        )}
      </section>

      {/* Modal de visualização completa */}
      <PatientDetailsModal
        isOpen={modalType === 'view'}
        patient={selectedPatient}
        onClose={handleCloseModal}
      />

      {/* Modal de cadastro e edição */}
      {(modalType === 'create' || modalType === 'edit') && (
        <PatientFormModal
          isOpen={true}
          mode={modalType}
          patient={modalType === 'edit' ? selectedPatient : null}
          onClose={handleCloseModal}
          onSubmit={handleFormSubmit}
          loading={submitting}
          apiError={formError}
        />
      )}

      {/* Diálogo de confirmação de exclusão */}
      <DeletePatientDialog
        isOpen={modalType === 'delete'}
        patient={selectedPatient}
        onClose={handleCloseModal}
        onConfirm={handleDeleteConfirm}
        loading={submitting}
      />
    </div>
  );
}
