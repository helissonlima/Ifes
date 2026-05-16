import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AppProvider } from './context/AppContext';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Propriedades from './pages/Propriedades';
import NovaAvaliacao from './pages/NovaAvaliacao';
import Resultado from './pages/Resultado';
import Historico from './pages/Historico';
import Metodologia from './pages/Metodologia';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="/propriedades" element={<Propriedades />} />
              <Route path="/avaliacao/nova" element={<NovaAvaliacao />} />
              <Route path="/avaliacao/:id" element={<Resultado />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/metodologia" element={<Metodologia />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
