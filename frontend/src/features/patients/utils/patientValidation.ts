import type { PatientFormData, PatientFormErrors } from '../types/patient.types';
import { cleanDigits } from './patientFormatters';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validatePatientForm(data: PatientFormData): PatientFormErrors {
  const errors: PatientFormErrors = {};

  // Nome completo
  if (!data.nomeCompleto || typeof data.nomeCompleto !== 'string' || data.nomeCompleto.trim().length === 0) {
    errors.nomeCompleto = 'Nome completo é obrigatório.';
  } else if (data.nomeCompleto.trim().length < 3) {
    errors.nomeCompleto = 'Nome completo deve conter pelo menos 3 caracteres.';
  }

  // CPF
  const cpfDigits = cleanDigits(data.cpf);
  if (!cpfDigits) {
    errors.cpf = 'CPF é obrigatório.';
  } else if (cpfDigits.length !== 11) {
    errors.cpf = 'CPF deve conter 11 dígitos numéricos.';
  }

  // Data de nascimento
  if (!data.dataNascimento) {
    errors.dataNascimento = 'Data de nascimento é obrigatória.';
  } else {
    const dataObj = new Date(data.dataNascimento);
    if (Number.isNaN(dataObj.getTime())) {
      errors.dataNascimento = 'Data de nascimento inválida.';
    } else {
      const hoje = new Date();
      if (dataObj > hoje) {
        errors.dataNascimento = 'Data de nascimento não pode ser futura.';
      }
    }
  }

  // Gênero
  const generosValidos = ['male', 'female', 'other', 'unknown'];
  if (!data.genero || !generosValidos.includes(data.genero)) {
    errors.genero = 'Selecione um gênero válido.';
  }

  // Email (opcional, mas validado se preenchido)
  if (data.email && data.email.trim().length > 0) {
    if (!EMAIL_REGEX.test(data.email.trim())) {
      errors.email = 'E-mail informado é inválido.';
    }
  }

  // Telefone (opcional, mas validado se preenchido)
  if (data.telefone) {
    const telDigits = cleanDigits(data.telefone);
    if (telDigits.length > 0 && telDigits.length !== 10 && telDigits.length !== 11) {
      errors.telefone = 'Telefone deve conter DDD e número (10 ou 11 dígitos).';
    }
  }

  return errors;
}

