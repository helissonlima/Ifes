import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import theme from './theme';
import { AppProvider, useApp } from './context/AppContext';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Propriedades from './pages/Propriedades';
import NovaAvaliacao from './pages/NovaAvaliacao';
import Resultado from './pages/Resultado';
import Historico from './pages/Historico';
import Metodologia from './pages/Metodologia';
import Guia from './pages/Guia';
import Login from './pages/Login';
import Usuarios from './pages/Usuarios';

function CenterLoading() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <CircularProgress />
    </Box>
  );
}

function RequireAuth({ children }) {
  const { isAuthenticated, loadingAuth } = useApp();
  if (loadingAuth) return <CenterLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function RequirePermission({ permission, children }) {
  const { hasPermission } = useApp();
  if (!hasPermission(permission)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { loadSession, loadingAuth, isAuthenticated } = useApp();

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  if (loadingAuth) return <CenterLoading />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route
          element={(
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          )}
        >
          <Route path="/" element={<RequirePermission permission="dashboard"><Dashboard /></RequirePermission>} />
          <Route path="/propriedades" element={<RequirePermission permission="propriedades"><Propriedades /></RequirePermission>} />
          <Route path="/avaliacao/nova" element={<RequirePermission permission="avaliacoes"><NovaAvaliacao /></RequirePermission>} />
          <Route path="/avaliacao/:id" element={<RequirePermission permission="historico"><Resultado /></RequirePermission>} />
          <Route path="/historico" element={<RequirePermission permission="historico"><Historico /></RequirePermission>} />
          <Route path="/metodologia" element={<RequirePermission permission="metodologia"><Metodologia /></RequirePermission>} />
          <Route path="/guia" element={<RequirePermission permission="metodologia"><Guia /></RequirePermission>} />
          <Route path="/usuarios" element={<RequirePermission permission="usuarios"><Usuarios /></RequirePermission>} />
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
        <AppRoutes />
      </AppProvider>
    </ThemeProvider>
  );
}
