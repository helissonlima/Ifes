import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import theme from './theme';
import { AppProvider, useApp } from './context/AppContext';
import MainLayout from './components/Layout/MainLayout';
import ErrorBoundary from './components/Common/ErrorBoundary';
import UpdatePrompt from './components/Common/UpdatePrompt';

const AcessoNegado = lazy(() => import('./pages/AcessoNegado'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Propriedades = lazy(() => import('./pages/Propriedades'));
const PropriedadeDetalhe = lazy(() => import('./pages/PropriedadeDetalhe'));
const NovaAvaliacao = lazy(() => import('./pages/NovaAvaliacao'));
const Resultado = lazy(() => import('./pages/Resultado'));
const Historico = lazy(() => import('./pages/Historico'));
const Metodologia = lazy(() => import('./pages/Metodologia'));
const Guia = lazy(() => import('./pages/Guia'));
const Login = lazy(() => import('./pages/Login'));
const Usuarios = lazy(() => import('./pages/Usuarios'));
const Graos = lazy(() => import('./pages/Graos'));

function CenterLoading({ title = 'Carregando sistema', description = 'Preparando sessão, permissões e dados iniciais.' }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 3 }}>
      <Box sx={{ display: 'grid', justifyItems: 'center', gap: 2, textAlign: 'center', maxWidth: 420 }}>
        <CircularProgress />
        <Box>
          <Box component="h1" sx={{ fontSize: '1.2rem', fontWeight: 800, color: 'text.primary', mb: 0.75 }}>
            {title}
          </Box>
          <Box component="p" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
            {description}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function RequireAuth({ children }) {
  const { isAuthenticated, loadingAuth } = useApp();
  if (loadingAuth) return <CenterLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export function RequirePermission({ permission, children }) {
  const { hasPermission } = useApp();
  if (!hasPermission(permission)) return <Navigate to="/acesso-negado" replace state={{ reason: 'permission' }} />;
  return children;
}

export function RequireAdmin({ children }) {
  const { user } = useApp();
  if (user?.role !== 'admin') return <Navigate to="/acesso-negado" replace state={{ reason: 'admin' }} />;
  return children;
}

function AppRoutes() {
  const { loadSession, loadingAuth, isAuthenticated } = useApp();

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  if (loadingAuth) return <CenterLoading title="Restaurando sessão" description="Verificando autenticação e permissões disponíveis para este perfil." />;

  const withLazy = (children) => (
    <Suspense fallback={<CenterLoading title="Carregando página" description="Otimizando recursos para esta tela." />}>
      {children}
    </Suspense>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : withLazy(<Login />)} />
        <Route path="/acesso-negado" element={withLazy(<AcessoNegado />)} />
        <Route
          element={(
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          )}
        >
          <Route path="/" element={<RequirePermission permission="dashboard">{withLazy(<Dashboard />)}</RequirePermission>} />
          <Route path="/propriedades" element={<RequirePermission permission="propriedades">{withLazy(<Propriedades />)}</RequirePermission>} />
          <Route path="/propriedades/:id" element={<RequirePermission permission="propriedades">{withLazy(<PropriedadeDetalhe />)}</RequirePermission>} />
          <Route path="/avaliacao/nova" element={<RequirePermission permission="avaliacoes">{withLazy(<NovaAvaliacao />)}</RequirePermission>} />
          <Route path="/avaliacao/:id" element={<RequirePermission permission="historico">{withLazy(<Resultado />)}</RequirePermission>} />
          <Route path="/historico" element={<RequirePermission permission="historico">{withLazy(<Historico />)}</RequirePermission>} />
          <Route path="/metodologia" element={<RequirePermission permission="metodologia">{withLazy(<Metodologia />)}</RequirePermission>} />
          <Route path="/guia" element={<RequirePermission permission="metodologia">{withLazy(<Guia />)}</RequirePermission>} />
          <Route path="/usuarios" element={<RequireAdmin>{withLazy(<Usuarios />)}</RequireAdmin>} />
          <Route path="/graos" element={<RequireAdmin>{withLazy(<Graos />)}</RequireAdmin>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
        <UpdatePrompt />
      </AppProvider>
    </ThemeProvider>
  );
}
