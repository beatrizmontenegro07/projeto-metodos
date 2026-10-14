import { useState, type FormEvent } from 'react';
import { Button } from '../../../components/ui/Button/Button';
import { Checkbox } from '../../../components/ui/Checkbox/Checkbox';
import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import type { Patient, PatientFormData, PatientFormErrors } from '../types/patient.types';
import {
  cleanDigits,
  maskCep,
  maskCpf,
  maskPhone,
} from '../utils/patientFormatters';
import { validatePatientForm } from '../utils/patientValidation';
import styles from './PatientForm.module.css';

interface PatientFormProps {
  initialPatient?: Patient | null;
  mode: 'create' | 'edit';
  onSubmit: (data: PatientFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  apiError?: string | null;
}

const GENDER_OPTIONS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' },
  { value: 'other', label: 'Outro' },
  { value: 'unknown', label: 'Não informado' },
];

const PHONE_TYPE_OPTIONS = [
  { value: 'mobile', label: 'Celular' },
  { value: 'home', label: 'Residencial' },
  { value: 'work', label: 'Comercial' },
];

export function PatientForm({
  initialPatient,
  mode,
  onSubmit,
  onCancel,
  loading = false,
  apiError,
}: PatientFormProps) {
  const initialPhone = initialPatient?.telefones?.[0];

  const [formData, setFormData] = useState<PatientFormData>({
    nomeCompleto: initialPatient?.nomeCompleto || '',
    cpf: initialPatient?.cpf ? maskCpf(initialPatient.cpf) : '',
    cns: initialPatient?.cns || '',
    dataNascimento: initialPatient?.dataNascimento || '',
    genero: initialPatient?.genero || 'male',
    telefone: initialPhone ? maskPhone(initialPhone.numero) : '',
    tipoTelefone: initialPhone?.tipo || 'mobile',
    email: initialPatient?.email || '',
    logradouro: initialPatient?.endereco?.logradouro || '',
    numero: initialPatient?.endereco?.numero || '',
    complemento: initialPatient?.endereco?.complemento || '',
    bairro: initialPatient?.endereco?.bairro || '',
    cidade: initialPatient?.endereco?.cidade || '',
    uf: initialPatient?.endereco?.uf || '',
    cep: initialPatient?.endereco?.cep ? maskCep(initialPatient.endereco.cep) : '',
    ativo: initialPatient?.ativo !== undefined ? initialPatient.ativo : true,
  });

  const [errors, setErrors] = useState<PatientFormErrors>({});

  const handleChange = (field: keyof PatientFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validatePatientForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {apiError && (
        <div className={styles.apiError} role="alert">
          {apiError}
        </div>
      )}

      {/* Dados Pessoais */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Dados Pessoais</legend>
        <div className={styles.grid}>
          <div className={styles.colSpan2}>
            <Input
              label="Nome completo *"
              value={formData.nomeCompleto}
              onChange={(e) => handleChange('nomeCompleto', e.target.value)}
              error={errors.nomeCompleto}
              placeholder="Ex.: Ana Souza Silva"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Input
              label="CPF *"
              value={formData.cpf}
              onChange={(e) => handleChange('cpf', maskCpf(e.target.value))}
              error={errors.cpf}
              placeholder="000.000.000-00"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Input
              label="Data de nascimento *"
              type="date"
              value={formData.dataNascimento}
              onChange={(e) => handleChange('dataNascimento', e.target.value)}
              error={errors.dataNascimento}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Select
              label="Gênero *"
              value={formData.genero}
              onChange={(e) => handleChange('genero', e.target.value)}
              options={GENDER_OPTIONS}
              error={errors.genero}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Input
              label="CNS (Cartão Nacional de Saúde)"
              value={formData.cns || ''}
              onChange={(e) => handleChange('cns', cleanDigits(e.target.value))}
              placeholder="Ex.: 700000000000001"
              disabled={loading}
            />
          </div>
        </div>
      </fieldset>

      {/* Contato */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Informações de Contato</legend>
        <div className={styles.grid}>
          <div className={styles.colSpan2}>
            <Input
              label="E-mail"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              placeholder="paciente@email.com"
              disabled={loading}
            />
          </div>

          <div>
            <Input
              label="Telefone principal"
              value={formData.telefone || ''}
              onChange={(e) => handleChange('telefone', maskPhone(e.target.value))}
              error={errors.telefone}
              placeholder="(83) 98765-4321"
              disabled={loading}
            />
          </div>

          <div>
            <Select
              label="Tipo de telefone"
              value={formData.tipoTelefone || 'mobile'}
              onChange={(e) => handleChange('tipoTelefone', e.target.value)}
              options={PHONE_TYPE_OPTIONS}
              disabled={loading}
            />
          </div>
        </div>
      </fieldset>

      {/* Endereço */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Endereço (opcional)</legend>
        <div className={styles.grid}>
          <div className={styles.colSpan2}>
            <Input
              label="Logradouro"
              value={formData.logradouro || ''}
              onChange={(e) => handleChange('logradouro', e.target.value)}
              placeholder="Rua, avenida..."
              disabled={loading}
            />
          </div>

          <div>
            <Input
              label="Número"
              value={formData.numero || ''}
              onChange={(e) => handleChange('numero', e.target.value)}
              placeholder="123"
              disabled={loading}
            />
          </div>

          <div>
            <Input
              label="Complemento"
              value={formData.complemento || ''}
              onChange={(e) => handleChange('complemento', e.target.value)}
              placeholder="Apto, bloco..."
              disabled={loading}
            />
          </div>

          <div>
            <Input
              label="Bairro"
              value={formData.bairro || ''}
              onChange={(e) => handleChange('bairro', e.target.value)}
              placeholder="Centro"
              disabled={loading}
            />
          </div>

          <div>
            <Input
              label="Cidade"
              value={formData.cidade || ''}
              onChange={(e) => handleChange('cidade', e.target.value)}
              placeholder="João Pessoa"
              disabled={loading}
            />
          </div>

          <div>
            <Input
              label="UF"
              value={formData.uf || ''}
              onChange={(e) => handleChange('uf', e.target.value.toUpperCase().slice(0, 2))}
              placeholder="PB"
              maxLength={2}
              disabled={loading}
            />
          </div>

          <div>
            <Input
              label="CEP"
              value={formData.cep || ''}
              onChange={(e) => handleChange('cep', maskCep(e.target.value))}
              placeholder="58000-000"
              disabled={loading}
            />
          </div>
        </div>
      </fieldset>

      {/* Status */}
      <div className={styles.statusRow}>
        <Checkbox
          label="Paciente ativo no sistema"
          checked={formData.ativo}
          onChange={(checked) => handleChange('ativo', checked)}
          disabled={loading}
        />
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {mode === 'create' ? 'Cadastrar paciente' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}
