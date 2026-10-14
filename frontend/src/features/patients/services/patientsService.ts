import { deleteJson, getJson, postJson, putJson } from '../../../services/api/apiClient';
import type { Patient, PatientFormData, PatientListResponse } from '../types/patient.types';
import { cleanDigits } from '../utils/patientFormatters';

export interface FetchPatientsParams {
  pagina?: number;
  tamanhoPagina?: number;
  busca?: string;
  status?: string;
  ordenacao?: string;
}

interface SinglePatientResponse {
  paciente: Patient;
}

function serializarCorpoPaciente(data: Partial<PatientFormData>) {
  const corpo: Record<string, unknown> = {};

  if (data.nomeCompleto !== undefined) corpo.nomeCompleto = data.nomeCompleto.trim();
  if (data.cpf !== undefined) corpo.cpf = cleanDigits(data.cpf);
  if (data.cns !== undefined) corpo.cns = data.cns ? cleanDigits(data.cns) : undefined;
  if (data.dataNascimento !== undefined) corpo.dataNascimento = data.dataNascimento;
  if (data.genero !== undefined) corpo.genero = data.genero;
  if (data.email !== undefined) corpo.email = data.email ? data.email.trim() : undefined;
  if (data.ativo !== undefined) corpo.ativo = Boolean(data.ativo);

  if (data.telefone !== undefined) {
    const limpo = cleanDigits(data.telefone);
    corpo.telefones = limpo ? [{ numero: limpo, tipo: data.tipoTelefone || 'mobile' }] : [];
  }

  if (
    data.logradouro !== undefined ||
    data.numero !== undefined ||
    data.complemento !== undefined ||
    data.bairro !== undefined ||
    data.cidade !== undefined ||
    data.uf !== undefined ||
    data.cep !== undefined
  ) {
    corpo.endereco = {
      logradouro: data.logradouro?.trim() || '',
      numero: data.numero?.trim() || '',
      complemento: data.complemento?.trim() || '',
      bairro: data.bairro?.trim() || '',
      cidade: data.cidade?.trim() || '',
      uf: data.uf?.trim() || '',
      cep: cleanDigits(data.cep) || '',
    };
  }

  return corpo;
}

export async function fetchPatients(params: FetchPatientsParams = {}): Promise<PatientListResponse> {
  const query = new URLSearchParams();
  if (params.pagina) query.set('pagina', String(params.pagina));
  if (params.tamanhoPagina) query.set('tamanhoPagina', String(params.tamanhoPagina));
  if (params.busca && params.busca.trim()) query.set('busca', params.busca.trim());
  if (params.status && params.status !== 'todos') query.set('status', params.status);
  if (params.ordenacao && params.ordenacao !== 'id') query.set('ordenacao', params.ordenacao);

  const queryString = query.toString();
  const url = `/api/pacientes${queryString ? `?${queryString}` : ''}`;
  return getJson<PatientListResponse>(url);
}

export async function getPatientById(id: number): Promise<Patient> {
  const res = await getJson<SinglePatientResponse>(`/api/pacientes/${id}`);
  return res.paciente;
}

export async function createPatient(data: PatientFormData): Promise<Patient> {
  const corpo = serializarCorpoPaciente(data);
  const res = await postJson<SinglePatientResponse>('/api/pacientes', corpo);
  return res.paciente;
}

export async function updatePatient(id: number, data: Partial<PatientFormData>): Promise<Patient> {
  const corpo = serializarCorpoPaciente(data);
  const res = await putJson<SinglePatientResponse>(`/api/pacientes/${id}`, corpo);
  return res.paciente;
}

export async function deletePatient(id: number): Promise<void> {
  await deleteJson<{ mensagem: string }>(`/api/pacientes/${id}`);
}

