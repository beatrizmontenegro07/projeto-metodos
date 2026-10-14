export type PatientGender = 'male' | 'female' | 'other' | 'unknown';

export type PatientPhoneType = 'mobile' | 'home' | 'work' | 'temp' | 'old';

export interface PatientPhone {
  numero: string;
  tipo: PatientPhoneType;
}

export interface PatientAddress {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
}

export interface Patient {
  id: number;
  cpf: string;
  cns?: string;
  nomeCompleto: string;
  dataNascimento: string;
  genero: PatientGender;
  telefones: PatientPhone[];
  email?: string;
  endereco?: PatientAddress;
  ativo: boolean;
}

export interface PatientFormData {
  nomeCompleto: string;
  cpf: string;
  cns?: string;
  dataNascimento: string;
  genero: PatientGender;
  telefone?: string;
  tipoTelefone?: PatientPhoneType;
  email?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  ativo: boolean;
}

export type PatientFormErrors = Partial<Record<keyof PatientFormData, string>>;

export interface PatientPagination {
  pagina: number;
  tamanhoPagina: number;
  totalItens: number;
  totalPaginas: number;
}

export interface PatientListResponse {
  dados: Patient[];
  paginacao: PatientPagination;
}

export interface PatientFilters {
  busca: string;
  status: 'todos' | 'ativo' | 'inativo';
  ordenacao: 'id' | 'nome-asc' | 'nome-desc' | 'recentes';
  pagina: number;
  tamanhoPagina: number;
}

export type PatientModalType = 'view' | 'create' | 'edit' | 'delete' | null;

