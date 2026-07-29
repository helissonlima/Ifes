import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useApp } from '../../src/context/AppContext';
import { RequireAuth, RequirePermission, RequireAdmin } from '../../src/App';

vi.mock('../../src/context/AppContext', () => ({
  AppProvider: ({ children }) => children,
  useApp: vi.fn(),
}));

function renderComGuarda(Guarda, guardaProps, { rotaProtegida = '/', rotaDestino }) {
  return render(
    <MemoryRouter initialEntries={[rotaProtegida]}>
      <Routes>
        <Route
          path={rotaProtegida}
          element={<Guarda {...guardaProps}><div>Conteúdo Protegido</div></Guarda>}
        />
        <Route path={rotaDestino} element={<div>Página de Destino</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RequireAuth', () => {
  it('mostra o loading enquanto a sessão ainda está sendo verificada', () => {
    useApp.mockReturnValue({ isAuthenticated: false, loadingAuth: true });
    renderComGuarda(RequireAuth, {}, { rotaDestino: '/login' });

    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
    expect(screen.queryByText('Página de Destino')).not.toBeInTheDocument();
  });

  it('redireciona para /login quando não autenticado', () => {
    useApp.mockReturnValue({ isAuthenticated: false, loadingAuth: false });
    renderComGuarda(RequireAuth, {}, { rotaDestino: '/login' });

    expect(screen.getByText('Página de Destino')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('renderiza o conteúdo quando autenticado', () => {
    useApp.mockReturnValue({ isAuthenticated: true, loadingAuth: false });
    renderComGuarda(RequireAuth, {}, { rotaDestino: '/login' });

    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
  });
});

describe('RequirePermission', () => {
  it('redireciona para /acesso-negado quando a permissão não é concedida', () => {
    useApp.mockReturnValue({ hasPermission: () => false });
    renderComGuarda(RequirePermission, { permission: 'usuarios' }, { rotaDestino: '/acesso-negado' });

    expect(screen.getByText('Página de Destino')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('renderiza o conteúdo quando a permissão é concedida', () => {
    useApp.mockReturnValue({ hasPermission: (key) => key === 'propriedades' });
    renderComGuarda(RequirePermission, { permission: 'propriedades' }, { rotaDestino: '/acesso-negado' });

    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
  });
});

describe('RequireAdmin', () => {
  it('redireciona para /acesso-negado quando o usuário não é admin', () => {
    useApp.mockReturnValue({ user: { role: 'tecnico' } });
    renderComGuarda(RequireAdmin, {}, { rotaDestino: '/acesso-negado' });

    expect(screen.getByText('Página de Destino')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('redireciona para /acesso-negado quando não há usuário carregado ainda', () => {
    useApp.mockReturnValue({ user: null });
    renderComGuarda(RequireAdmin, {}, { rotaDestino: '/acesso-negado' });

    expect(screen.getByText('Página de Destino')).toBeInTheDocument();
  });

  it('renderiza o conteúdo quando o usuário é admin', () => {
    useApp.mockReturnValue({ user: { role: 'admin' } });
    renderComGuarda(RequireAdmin, {}, { rotaDestino: '/acesso-negado' });

    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
  });
});
