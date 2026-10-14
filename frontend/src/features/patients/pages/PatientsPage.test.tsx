import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthenticatedUser } from '../../auth/types/auth.types';
import {
  createPatient,
  deletePatient,
  fetchPatients,
  updatePatient,
} from '../services/patientsService';
import type { Patient, PatientListResponse } from '../types/patient.types';
import { PatientsPage } from './PatientsPage';

vi.mock('../services/patientsService', () => ({
  fetchPatients: vi.fn(),
  getPatientById: vi.fn(),
  createPatient: vi.fn(),
  updatePatient: vi.fn(),
  deletePatient: vi.fn(),
}));

const fetchPatientsMock = vi.mocked(fetchPatients);
const createPatientMock = vi.mocked(createPatient);
const updatePatientMock = vi.mocked(updatePatient);
const deletePatientMock = vi.mocked(deletePatient);

const adminUser: AuthenticatedUser = {
  id: 1,
  name: 'Administrador CliniCore',
  email: 'admin@clinicore.com',
  login: 'admin',
  role: 'ADMINISTRADOR',
};

const receptionistUser: AuthenticatedUser = {
  id: 2,
  name: 'Paula Recepcionista',
  email: 'paula@clinicore.com',
  login: 'paula',
  role: 'RECEPCIONISTA',
};

const doctorUser: AuthenticatedUser = {
  id: 3,
  name: 'Dr. Carlos Médico',
  email: 'carlos@clinicore.com',
  login: 'drcarlos',
  role: 'MEDICO',
};

const patientUser: AuthenticatedUser = {
  id: 4,
  name: 'João Paciente',
  email: 'joao@paciente.com',
  login: 'joao',
  role: 'PACIENTE',
};

const mockPatient1: Patient = {
  id: 1,
  cpf: '12345678901',
  cns: '700000000000001',
  nomeCompleto: 'Maria Souza Silva',
  dataNascimento: '1988-04-12',
  genero: 'female',
  telefones: [{ numero: '83988887777', tipo: 'mobile' }],
  email: 'maria.souza@email.com',
  endereco: {
    logradouro: 'Av. Epitácio Pessoa',
    numero: '1000',
    complemento: 'Apto 201',
    bairro: 'Tambauzinho',
    cidade: 'João Pessoa',
    uf: 'PB',
    cep: '58042000',
  },
  ativo: true,
};

const mockPatient2: Patient = {
  id: 2,
  cpf: '98765432100',
  nomeCompleto: 'Carlos Eduardo Oliveira',
  dataNascimento: '1975-11-23',
  genero: 'male',
  telefones: [{ numero: '83999991111', tipo: 'mobile' }],
  email: 'carlos.eduardo@email.com',
  ativo: false,
};

const mockPatientsResponse: PatientListResponse = {
  dados: [mockPatient1, mockPatient2],
  paginacao: {
    pagina: 1,
    tamanhoPagina: 10,
    totalItens: 2,
    totalPaginas: 1,
  },
};

describe('PatientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchPatientsMock.mockResolvedValue(mockPatientsResponse);
  });

  // 1. Renderização da página com título, descrição, botão de novo paciente, área de pesquisa e filtros
  it('1. renderiza a página com título, descrição, botão de novo paciente, área de pesquisa e filtros', async () => {
    render(<PatientsPage currentUser={adminUser} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Pacientes' })).toBeInTheDocument();
    expect(
      screen.getByText(/gerencie os pacientes cadastrados no sistema, consulte históricos e atualize dados\./i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /novo paciente/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/buscar paciente por nome, cpf ou e-mail\.\.\./i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filtrar por status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ordenar pacientes/i)).toBeInTheDocument();
    expect(screen.getByText('Início')).toBeInTheDocument();
  });

  // 2. Renderização das colunas da tabela conforme a especificação
  it('2. renderiza as colunas da tabela conforme a especificação', async () => {
    render(<PatientsPage currentUser={adminUser} />);

    await waitFor(() => {
      expect(screen.getByRole('columnheader', { name: 'ID' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'CPF' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Nome Completo' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Data de Nascimento' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Telefone' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Ações' })).toBeInTheDocument();
    });
  });

  // 3. Exibição correta dos dados do paciente e das ações em cada linha
  it('3. exibe corretamente os dados dos pacientes formatados e as ações em cada linha', async () => {
    render(<PatientsPage currentUser={adminUser} />);

    await waitFor(() => {
      expect(screen.getByText('P001')).toBeInTheDocument();
      expect(screen.getByText('123.456.789-01')).toBeInTheDocument();
      expect(screen.getByText('Maria Souza Silva')).toBeInTheDocument();
      expect(screen.getByText('12/04/1988')).toBeInTheDocument();
      expect(screen.getByText('(83) 98888-7777')).toBeInTheDocument();
      expect(screen.getByText('maria.souza@email.com')).toBeInTheDocument();

      expect(screen.getByText('P002')).toBeInTheDocument();
      expect(screen.getByText('987.654.321-00')).toBeInTheDocument();
      expect(screen.getByText('Carlos Eduardo Oliveira')).toBeInTheDocument();
      expect(screen.getByText('23/11/1975')).toBeInTheDocument();
    });

    const table = screen.getByRole('table');
    expect(within(table).getByText('Ativo')).toBeInTheDocument();
    expect(within(table).getByText('Inativo')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /visualizar dados de maria souza silva/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /editar maria souza silva/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remover maria souza silva/i })).toBeInTheDocument();
  });

  // 4. Abertura do modal de visualização ao clicar no ícone de lupa, exibindo os dados completos do paciente selecionado
  it('4. abre o modal de visualização ao clicar no ícone de lupa e exibe os dados completos do paciente', async () => {
    const user = userEvent.setup();
    render(<PatientsPage currentUser={adminUser} />);

    await waitFor(() => {
      expect(screen.getByText('Maria Souza Silva')).toBeInTheDocument();
    });

    const viewButton = screen.getByRole('button', { name: /visualizar dados de maria souza silva/i });
    await user.click(viewButton);

    expect(await screen.findByRole('heading', { name: 'Detalhes do Paciente' })).toBeInTheDocument();
    expect(screen.getByText('Identificador: P001')).toBeInTheDocument();
    expect(screen.getByText('700000000000001')).toBeInTheDocument();
    expect(screen.getByText('Av. Epitácio Pessoa, 1000')).toBeInTheDocument();
    expect(screen.getByText('Tambauzinho')).toBeInTheDocument();
    expect(screen.getByText('João Pessoa - PB')).toBeInTheDocument();
    expect(screen.getByText('58042-000')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: 'Fechar' });
    await user.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Detalhes do Paciente' })).not.toBeInTheDocument();
    });
  });

  // 5. Abertura do modal de edição ao clicar no ícone de lápis, com os campos preenchidos com os dados do paciente correto
  it('5. abre o modal de edição ao clicar no ícone de lápis com os campos preenchidos e permite atualizar', async () => {
    const user = userEvent.setup();
    updatePatientMock.mockResolvedValue({
      ...mockPatient1,
      nomeCompleto: 'Maria Souza Silva Atualizada',
    });

    render(<PatientsPage currentUser={adminUser} />);

    await waitFor(() => {
      expect(screen.getByText('Maria Souza Silva')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /editar maria souza silva/i });
    await user.click(editButton);

    expect(await screen.findByRole('heading', { name: 'Editar paciente' })).toBeInTheDocument();
    const nameInput = screen.getByLabelText(/nome completo/i);
    expect(nameInput).toHaveValue('Maria Souza Silva');

    await user.clear(nameInput);
    await user.type(nameInput, 'Maria Souza Silva Atualizada');

    const saveButton = screen.getByRole('button', { name: /salvar alterações/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(updatePatientMock).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          nomeCompleto: 'Maria Souza Silva Atualizada',
        }),
      );
    });

    expect(await screen.findByText('Paciente atualizado com sucesso!')).toBeInTheDocument();
  });

  // 6. Abertura do modal de confirmação ao clicar no ícone de lixeira, identificando o paciente a ser removido
  it('6. abre o modal de confirmação ao clicar na lixeira identificando o paciente a ser removido', async () => {
    const user = userEvent.setup();
    render(<PatientsPage currentUser={adminUser} />);

    await waitFor(() => {
      expect(screen.getByText('Maria Souza Silva')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /remover maria souza silva/i });
    await user.click(deleteButton);

    expect(await screen.findByRole('heading', { name: 'Remover paciente?' })).toBeInTheDocument();
    expect(
      screen.getByText(/tem certeza que deseja remover o paciente "maria souza silva" \(p001\)\?/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover paciente' })).toBeInTheDocument();
  });

  // 7. Cancelamento da exclusão ao clicar em “Cancelar” no modal de confirmação, mantendo o paciente na lista
  it('7. cancela a exclusão ao clicar em "Cancelar" e mantém o paciente na lista', async () => {
    const user = userEvent.setup();
    render(<PatientsPage currentUser={adminUser} />);

    await waitFor(() => {
      expect(screen.getByText('Maria Souza Silva')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /remover maria souza silva/i });
    await user.click(deleteButton);

    const cancelButton = await screen.findByRole('button', { name: 'Cancelar' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Remover paciente?' })).not.toBeInTheDocument();
    });

    expect(deletePatientMock).not.toHaveBeenCalled();
    expect(screen.getByText('Maria Souza Silva')).toBeInTheDocument();
  });

  // 8. Confirmação da exclusão ao clicar em “Remover paciente”, disparando a requisição correta e atualizando a listagem
  it('8. confirma a exclusão ao clicar em "Remover paciente", disparando a requisição e atualizando a listagem', async () => {
    const user = userEvent.setup();
    deletePatientMock.mockResolvedValue();

    render(<PatientsPage currentUser={adminUser} />);

    await waitFor(() => {
      expect(screen.getByText('Maria Souza Silva')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /remover maria souza silva/i });
    await user.click(deleteButton);

    const confirmButton = await screen.findByRole('button', { name: 'Remover paciente' });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(deletePatientMock).toHaveBeenCalledWith(1);
    });

    expect(await screen.findByText('Paciente removido com sucesso!')).toBeInTheDocument();
    expect(fetchPatientsMock).toHaveBeenCalledTimes(2);
  });

  // 9. Abertura do modal de cadastro ao clicar no botão “+ Novo paciente”, com o formulário limpo e validação funcionando
  it('9. abre o modal de cadastro ao clicar em "+ Novo paciente" com validação obrigatória e permite cadastrar', async () => {
    const user = userEvent.setup();
    createPatientMock.mockResolvedValue({
      ...mockPatient1,
      id: 3,
      nomeCompleto: 'Novo Paciente Cadastrado',
      cpf: '11122233344',
    });

    render(<PatientsPage currentUser={adminUser} />);

    const newBtn = screen.getByRole('button', { name: /novo paciente/i });
    await user.click(newBtn);

    expect(await screen.findByRole('heading', { name: 'Novo paciente' })).toBeInTheDocument();

    // Validação de campos obrigatórios ao submeter vazio
    const submitBtn = screen.getByRole('button', { name: 'Cadastrar paciente' });
    await user.click(submitBtn);

    expect(await screen.findByText('Nome completo é obrigatório.')).toBeInTheDocument();
    expect(screen.getByText('CPF é obrigatório.')).toBeInTheDocument();
    expect(screen.getByText('Data de nascimento é obrigatória.')).toBeInTheDocument();
    expect(createPatientMock).not.toHaveBeenCalled();

    // Preenche com dados válidos
    const nameInput = screen.getByLabelText(/nome completo \*/i);
    const cpfInput = screen.getByLabelText(/cpf \*/i);
    const birthInput = screen.getByLabelText(/data de nascimento \*/i);

    await user.type(nameInput, 'Novo Paciente Cadastrado');
    await user.type(cpfInput, '11122233344');
    await user.type(birthInput, '1995-05-15');

    await user.click(submitBtn);

    await waitFor(() => {
      expect(createPatientMock).toHaveBeenCalledWith(
        expect.objectContaining({
          nomeCompleto: 'Novo Paciente Cadastrado',
          cpf: '111.222.333-44',
          dataNascimento: '1995-05-15',
        }),
      );
    });

    expect(await screen.findByText('Paciente cadastrado com sucesso!')).toBeInTheDocument();
  });

  // 10. Comportamento da busca e da paginação, alterando os parâmetros e os dados exibidos
  it('10. atualiza a busca e altera paginação disparando nova consulta à API', async () => {
    const user = userEvent.setup();
    fetchPatientsMock.mockResolvedValue({
      dados: [mockPatient1],
      paginacao: {
        pagina: 1,
        tamanhoPagina: 1,
        totalItens: 2,
        totalPaginas: 2,
      },
    });

    render(<PatientsPage currentUser={adminUser} />);

    await waitFor(() => {
      expect(screen.getByText('Maria Souza Silva')).toBeInTheDocument();
    });

    // Teste de busca
    const searchInput = screen.getByPlaceholderText(/buscar paciente por nome, cpf ou e-mail\.\.\./i);
    await user.type(searchInput, 'Maria');

    await waitFor(() => {
      expect(fetchPatientsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          busca: 'Maria',
        }),
      );
    });

    // Teste de paginação: clica na próxima página
    const nextPageBtn = await screen.findByRole('button', { name: /próxima página/i });
    await user.click(nextPageBtn);

    await waitFor(() => {
      expect(fetchPatientsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          pagina: 2,
        }),
      );
    });
  });

  // 11. Exibição de mensagem apropriada quando a listagem estiver vazia ou quando ocorrer erro no carregamento
  it('11. exibe mensagem amigável quando a lista estiver vazia e trata erro de carregamento com opção de tentar novamente', async () => {
    // Cenário 1: Lista vazia
    fetchPatientsMock.mockResolvedValueOnce({
      dados: [],
      paginacao: {
        pagina: 1,
        tamanhoPagina: 10,
        totalItens: 0,
        totalPaginas: 1,
      },
    });

    const { unmount } = render(<PatientsPage currentUser={adminUser} />);
    expect(await screen.findByText('Nenhum paciente cadastrado.')).toBeInTheDocument();
    unmount();

    // Cenário 2: Erro no carregamento
    fetchPatientsMock.mockRejectedValueOnce(new Error('Falha na comunicação com o servidor.'));
    render(<PatientsPage currentUser={adminUser} />);

    expect(
      await screen.findByText('Falha na comunicação com o servidor.'),
    ).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /tentar novamente/i });
    expect(retryBtn).toBeInTheDocument();

    // Cenário 3: Recuperação após clicar em tentar novamente
    fetchPatientsMock.mockResolvedValueOnce(mockPatientsResponse);
    const user = userEvent.setup();
    await user.click(retryBtn);

    expect(await screen.findByText('Maria Souza Silva')).toBeInTheDocument();
  });

  // 12. Bloqueio de acesso para perfis não autorizados (médico e paciente)
  it('12. bloqueia acesso para perfis não autorizados (médico e paciente) e permite para administrador e recepcionista', () => {
    // Médico bloqueado
    const { rerender } = render(<PatientsPage currentUser={doctorUser} />);
    expect(screen.getByRole('heading', { name: 'Acesso restrito' })).toBeInTheDocument();
    expect(
      screen.getByText(/você não possui permissão para gerenciar pacientes/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /novo paciente/i })).not.toBeInTheDocument();

    // Paciente bloqueado
    rerender(<PatientsPage currentUser={patientUser} />);
    expect(screen.getByRole('heading', { name: 'Acesso restrito' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /novo paciente/i })).not.toBeInTheDocument();

    // Recepcionista permitido
    rerender(<PatientsPage currentUser={receptionistUser} />);
    expect(screen.queryByRole('heading', { name: 'Acesso restrito' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Pacientes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /novo paciente/i })).toBeInTheDocument();

    // Administrador permitido
    rerender(<PatientsPage currentUser={adminUser} />);
    expect(screen.queryByRole('heading', { name: 'Acesso restrito' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Pacientes' })).toBeInTheDocument();
  });
});

