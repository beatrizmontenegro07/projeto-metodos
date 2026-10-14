import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';
import { login } from './features/auth/services/authService';
import type { AuthSession } from './features/auth/types/auth.types';
import { fetchPatients } from './features/patients/services/patientsService';

vi.mock('./features/auth/services/authService', () => ({
  login: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('./features/patients/services/patientsService', () => ({
  fetchPatients: vi.fn(),
  getPatientById: vi.fn(),
  createPatient: vi.fn(),
  updatePatient: vi.fn(),
  deletePatient: vi.fn(),
}));

const loginMock = vi.mocked(login);
const fetchPatientsMock = vi.mocked(fetchPatients);

const mockSession: AuthSession = {
  accessToken: 'jwt-token-123',
  user: {
    id: 1,
    name: 'Ana Recepcionista',
    email: 'ana@clinicore.com',
    login: 'anarecep',
    role: 'RECEPCIONISTA',
  },
};

describe('App integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchPatientsMock.mockResolvedValue({
      dados: [],
      paginacao: { pagina: 1, tamanhoPagina: 10, totalItens: 0, totalPaginas: 1 },
    });
  });

  it('exibe tela de login quando não autenticado e transiciona para tela de pacientes após autenticação', async () => {
    loginMock.mockResolvedValue(mockSession);
    const user = userEvent.setup();

    render(<App />);

    // Tela de login inicial
    expect(screen.getByRole('heading', { name: /bem-vindo ao clinicore!/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/e-mail ou usuário/i), 'anarecep');
    await user.type(screen.getByLabelText(/^senha$/i), 'Senha@123');
    await user.click(screen.getByRole('button', { name: /^entrar/i }));

    // Após login, exibe o layout com o nome do usuário e a página de pacientes
    await waitFor(() => {
      expect(screen.getByText('Ana Recepcionista')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: 'Pacientes' })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /novo paciente/i })).toBeInTheDocument();
  });
});

