import { useCallback, useEffect, useState } from 'react';
import { fetchPatients } from '../services/patientsService';
import type { Patient, PatientFilters, PatientPagination } from '../types/patient.types';

export function usePatients(initialPageSize = 10) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<PatientFilters>({
    busca: '',
    status: 'todos',
    ordenacao: 'id',
    pagina: 1,
    tamanhoPagina: initialPageSize,
  });

  const [pagination, setPagination] = useState<PatientPagination>({
    pagina: 1,
    tamanhoPagina: initialPageSize,
    totalItens: 0,
    totalPaginas: 1,
  });

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPatients({
        pagina: filters.pagina,
        tamanhoPagina: filters.tamanhoPagina,
        busca: filters.busca,
        status: filters.status,
        ordenacao: filters.ordenacao,
      });
      setPatients(res.dados || []);
      setPagination(
        res.paginacao || {
          pagina: filters.pagina,
          tamanhoPagina: filters.tamanhoPagina,
          totalItens: (res.dados || []).length,
          totalPaginas: 1,
        },
      );
    } catch (err: any) {
      setError(err?.message || 'Não foi possível carregar a lista de pacientes.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleSearchChange = (busca: string) => {
    setFilters((prev) => ({ ...prev, busca, pagina: 1 }));
  };

  const handleStatusChange = (status: 'todos' | 'ativo' | 'inativo') => {
    setFilters((prev) => ({ ...prev, status, pagina: 1 }));
  };

  const handleOrderChange = (ordenacao: 'id' | 'nome-asc' | 'nome-desc' | 'recentes') => {
    setFilters((prev) => ({ ...prev, ordenacao, pagina: 1 }));
  };

  const handlePageChange = (pagina: number) => {
    setFilters((prev) => ({ ...prev, pagina }));
  };

  return {
    patients,
    loading,
    error,
    filters,
    pagination,
    reload: loadPatients,
    setSearch: handleSearchChange,
    setStatus: handleStatusChange,
    setOrder: handleOrderChange,
    setPage: handlePageChange,
  };
}

