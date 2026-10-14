import type { PatientGender, PatientPhone } from '../types/patient.types';

export function cleanDigits(value?: string | null): string {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
}

export function formatPatientId(id: number | string): string {
  const num = Number(id);
  if (Number.isNaN(num)) return String(id);
  return `P${String(num).padStart(3, '0')}`;
}

export function formatCpf(cpf?: string | null): string {
  if (!cpf) return '—';
  const digits = cleanDigits(cpf);
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function maskCpf(value: string): string {
  const digits = cleanDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function formatPhone(phone?: string | PatientPhone | null): string {
  if (!phone) return '—';
  const rawNumber = typeof phone === 'object' ? phone.numero : phone;
  const digits = cleanDigits(rawNumber);
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return rawNumber || '—';
}

export function maskPhone(value: string): string {
  const digits = cleanDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function formatDate(isoDate?: string | null): string {
  if (!isoDate) return '—';
  const match = String(isoDate).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, ano, mes, dia] = match;
    return `${dia}/${mes}/${ano}`;
  }
  return isoDate;
}

export function formatGender(gender?: PatientGender | string | null): string {
  switch (gender) {
    case 'male':
      return 'Masculino';
    case 'female':
      return 'Feminino';
    case 'other':
      return 'Outro';
    case 'unknown':
      return 'Não informado';
    default:
      return 'Não informado';
  }
}

export function formatCep(cep?: string | null): string {
  if (!cep) return '';
  const digits = cleanDigits(cep);
  if (digits.length === 8) {
    return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return cep;
}

export function maskCep(value: string): string {
  const digits = cleanDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

