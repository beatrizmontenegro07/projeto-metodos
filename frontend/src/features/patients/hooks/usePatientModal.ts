import { useState } from 'react';
import type { Patient, PatientModalType } from '../types/patient.types';

export function usePatientModal() {
  const [modalType, setModalType] = useState<PatientModalType>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const openView = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalType('view');
  };

  const openCreate = () => {
    setSelectedPatient(null);
    setModalType('create');
  };

  const openEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalType('edit');
  };

  const openDelete = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalType('delete');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedPatient(null);
  };

  return {
    modalType,
    selectedPatient,
    openView,
    openCreate,
    openEdit,
    openDelete,
    closeModal,
  };
}

